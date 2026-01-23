// functions/terminal-chat.ts
import type { PagesFunction } from "@cloudflare/workers-types";
import type { TerminalPromptEnv } from "./terminal-system-prompt";
import { buildTerminalSystemPrompt } from "./terminal-system-prompt";

type Env = TerminalPromptEnv & {
  CEREBRAS_API_KEY?: string;
  /** Optional: override to point at CF AI Gateway or a mock */
  CEREBRAS_API_URL?: string;
  /** Optional: set "1" to expose a small debug header */
  DEBUG?: string;
};

type ChatPayload = {
  model?: string;
  messages: unknown[];
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stop?: string[];
  seed?: number;
  response_format?: Record<string, unknown>;
};

const DEFAULT_API_URL = "https://api.cerebras.ai/v1/chat/completions";
const MAX_HISTORY_MESSAGES = 50;
export const MAX_MESSAGE_LENGTH = 2000;
const THINK_PATTERN = /<think>[\s\S]*?<\/think>/g;
const READ_TOOL_NAME = "read";
const TOOL_RESULT_PREFIX = "TOOL_RESULT:";
const MAX_TOOL_CONTENT_LENGTH = 8000;

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/* ---------- small helpers ---------- */

const readJSON = async <T>(req: Request): Promise<T | null> => {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
};

/* ---------- POST (proxy to Cerebras) ---------- */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const apiKey = env.CEREBRAS_API_KEY?.trim();
  if (!apiKey) {
    return json({ error: "Missing binding 'CEREBRAS_API_KEY' on this deployment." }, 500, {
      "X-Missing-Binding": "CEREBRAS_API_KEY",
    });
  }

  const payload = await readJSON<ChatPayload>(request);
  if (!payload) {
    return json({ error: "Invalid JSON payload" }, 400);
  }

  const { messages } = payload;
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: "`messages` must be a non-empty array" }, 400);
  }

  const sanitizedMessages: ChatMessage[] = [];

  for (const entry of messages) {
    if (!entry || typeof entry !== "object") continue;
    const role =
      typeof (entry as Record<string, unknown>).role === "string"
        ? (entry as Record<string, unknown>).role.trim().toLowerCase()
        : "";
    const content = (entry as Record<string, unknown>).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string" || content.trim() === "") continue;

    const normalizedRole = role as "user" | "assistant";
    const cleanedContent =
      normalizedRole === "assistant" ? stripThinkingSegments(content) : content;

    sanitizedMessages.push({
      role: normalizedRole,
      content: truncateContent(cleanedContent),
    });
  }

  const recentMessages = sanitizedMessages.slice(-MAX_HISTORY_MESSAGES);

  if (!recentMessages.some((msg) => msg.role === "user")) {
    return json({ error: "At least one user message is required" }, 400);
  }

  const today = new Date().toISOString().slice(0, 10);
  const terminalPrompt = await buildTerminalSystemPrompt(env, request);
  const systemPrompt = `The current date is ${today}. ${terminalPrompt}`;

  const outgoingMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...recentMessages,
  ];

  const outgoing: Record<string, unknown> = {
    model: "qwen-3-32b",
    messages: outgoingMessages,
    stream: false,
  };

  const apiURL = env.CEREBRAS_API_URL?.trim() || DEFAULT_API_URL;

  const buildUpstreamInit = (body: Record<string, unknown>): RequestInit => ({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Cerebras auth is a Bearer token
      Authorization: `Bearer ${apiKey}`, // 3
    },
    body: JSON.stringify(body),
  });

  const buildHeaders = (upstreamHeaders: Headers): Headers => {
    const headers = new Headers(upstreamHeaders);
    headers.set("Cache-Control", "no-store");
    headers.delete("www-authenticate");
    if (env.DEBUG === "1") headers.set("X-Has-Cerebras-Key", "1");
    if (!headers.has("content-type")) headers.set("content-type", "application/json");
    return headers;
  };

  const sendUpstream = async (body: Record<string, unknown>) => {
    let upstream: Response;
    try {
      upstream = await fetch(apiURL, buildUpstreamInit(body));
    } catch (err) {
      console.error("Cerebras proxy request failed", err);
      return {
        upstream: null,
        text: null,
        error: json({ error: "Failed to reach Cerebras API" }, 502),
      };
    }

    if (body.stream === true) {
      return { upstream, text: null, error: null };
    }

    const text = await upstream.text();
    return { upstream, text, error: null };
  };

  const firstAttempt = await sendUpstream(outgoing);
  if (firstAttempt.error) return firstAttempt.error;
  if (!firstAttempt.upstream) return json({ error: "Failed to reach Cerebras API" }, 502);

  const firstHeaders = buildHeaders(firstAttempt.upstream.headers);

  if (outgoing.stream === true) {
    return new Response(firstAttempt.upstream.body, {
      status: firstAttempt.upstream.status,
      statusText: firstAttempt.upstream.statusText,
      headers: firstHeaders,
    });
  }

  if (firstAttempt.text === null) {
    return json({ error: "Empty response from Cerebras API" }, 502);
  }

  const sanitizedText = sanitizeUpstreamText(firstAttempt.text);
  if (!firstAttempt.upstream.ok) {
    return new Response(sanitizedText, {
      status: firstAttempt.upstream.status,
      statusText: firstAttempt.upstream.statusText,
      headers: firstHeaders,
    });
  }

  const assistantText = extractAssistantText(sanitizedText);
  const toolCall = assistantText ? parseToolCall(assistantText) : null;

  if (!toolCall) {
    return new Response(sanitizedText, {
      status: firstAttempt.upstream.status,
      statusText: firstAttempt.upstream.statusText,
      headers: firstHeaders,
    });
  }

  const toolResult = await runReadTool(toolCall.input, request);
  const toolMessage = `${TOOL_RESULT_PREFIX}\n${toolResult}`;
  const followUpMessages: ChatMessage[] = [
    ...outgoingMessages,
    { role: "assistant", content: assistantText ?? "" },
    { role: "user", content: toolMessage },
  ];
  const followUpPayload: Record<string, unknown> = {
    ...outgoing,
    messages: followUpMessages,
  };

  const followUp = await sendUpstream(followUpPayload);
  if (followUp.error) return followUp.error;
  if (!followUp.upstream || followUp.text === null) {
    return json({ error: "Empty response from Cerebras API" }, 502);
  }

  const followUpHeaders = buildHeaders(followUp.upstream.headers);
  const followUpSanitized = sanitizeUpstreamText(followUp.text);
  return new Response(followUpSanitized, {
    status: followUp.upstream.status,
    statusText: followUp.upstream.statusText,
    headers: followUpHeaders,
  });
};

/* ---------- utils ---------- */
function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

export function truncateContent(text: string): string {
  return text.length > MAX_MESSAGE_LENGTH ? text.slice(0, MAX_MESSAGE_LENGTH) : text;
}

export function stripThinkingSegments(text: string): string {
  return text.replace(THINK_PATTERN, "").trim();
}

export function sanitizeUpstreamText(raw: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return stripThinkingSegments(raw);
  }

  if (!parsed || typeof parsed !== "object") {
    return stripThinkingSegments(raw);
  }

  let mutated = false;
  const data = parsed as Record<string, unknown>;

  if (typeof data.message === "string") {
    const cleaned = stripThinkingSegments(data.message);
    if (cleaned !== data.message) {
      data.message = cleaned;
      mutated = true;
    }
  }

  const choices = (data as { choices?: unknown[] }).choices;
  if (Array.isArray(choices)) {
    for (const choice of choices) {
      if (!choice || typeof choice !== "object") continue;
      const choiceRecord = choice as Record<string, unknown>;

      if (typeof choiceRecord.text === "string") {
        const cleaned = stripThinkingSegments(choiceRecord.text);
        if (cleaned !== choiceRecord.text) {
          choiceRecord.text = cleaned;
          mutated = true;
        }
      }

      if (choiceRecord.message && typeof choiceRecord.message === "object") {
        const message = choiceRecord.message as Record<string, unknown>;
        if (typeof message.content === "string") {
          const cleaned = stripThinkingSegments(message.content);
          if (cleaned !== message.content) {
            message.content = cleaned;
            mutated = true;
          }
        }
      }
    }
  }

  const response = (data as { response?: { output_text?: unknown } }).response;
  if (response && typeof response === "object") {
    const outputText = (response as { output_text?: unknown }).output_text;
    if (Array.isArray(outputText)) {
      for (let index = 0; index < outputText.length; index += 1) {
        const entry = outputText[index];
        if (typeof entry === "string") {
          const cleaned = stripThinkingSegments(entry);
          if (cleaned !== entry) {
            outputText[index] = cleaned;
            mutated = true;
          }
        }
      }
    }
  }

  return mutated ? JSON.stringify(data) : raw;
}

type ToolCall = {
  tool: string;
  input: string;
};

function extractAssistantText(raw: string): string | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return raw.trim() === "" ? null : raw;
  }

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  if (typeof (parsed as { message?: unknown }).message === "string") {
    return (parsed as { message: string }).message;
  }

  const choices = (parsed as { choices?: unknown[] }).choices;
  if (Array.isArray(choices)) {
    const firstChoice = choices[0] as Record<string, unknown> | undefined;
    const message = firstChoice?.message as Record<string, unknown> | undefined;
    if (typeof message?.content === "string") {
      return message.content;
    }
    if (typeof firstChoice?.text === "string") {
      return firstChoice.text;
    }
  }

  const response = (parsed as { response?: { output_text?: unknown } }).response;
  if (response && typeof response === "object") {
    const outputText = response.output_text;
    if (Array.isArray(outputText)) {
      return outputText.filter((entry): entry is string => typeof entry === "string").join("\n");
    }
  }

  return null;
}

function parseToolCall(raw: string): ToolCall | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") return null;
  const tool = (parsed as { tool?: unknown }).tool;
  const input = (parsed as { input?: unknown }).input;
  if (tool !== READ_TOOL_NAME || typeof input !== "string" || input.trim() === "") {
    return null;
  }
  return { tool: READ_TOOL_NAME, input: input.trim() };
}

async function runReadTool(input: string, request: Request): Promise<string> {
  const resolved = resolveToolUrl(input, request);
  try {
    const response = await fetch(resolved.toString());
    if (!response.ok) {
      return `error: failed to fetch ${resolved.toString()} (${response.status} ${response.statusText})`;
    }
    const text = await response.text();
    const trimmed = text.trim();
    if (trimmed.length <= MAX_TOOL_CONTENT_LENGTH) {
      return trimmed;
    }
    return `${trimmed.slice(0, MAX_TOOL_CONTENT_LENGTH)}\n...[truncated]`;
  } catch (error) {
    return `error: failed to fetch ${resolved.toString()} (${error instanceof Error ? error.message : "unknown error"})`;
  }
}

function resolveToolUrl(input: string, request: Request): URL {
  try {
    return new URL(input);
  } catch {
    return new URL(input.startsWith("/") ? input : `/${input}`, request.url);
  }
}
