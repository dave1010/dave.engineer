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

  const upstreamInit: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Cerebras auth is a Bearer token
      Authorization: `Bearer ${apiKey}`, // 3
    },
    body: JSON.stringify(outgoing),
  };

  let upstream: Response;
  try {
    upstream = await fetch(apiURL, upstreamInit);
  } catch (err) {
    console.error("Cerebras proxy request failed", err);
    return json({ error: "Failed to reach Cerebras API" }, 502);
  }

  // Prepare response headers: pass-through + no-store
  const headers = new Headers(upstream.headers);
  headers.set("Cache-Control", "no-store");
  headers.delete("www-authenticate");

  // Optional small debug signal (does not leak secrets)
  if (env.DEBUG === "1") headers.set("X-Has-Cerebras-Key", "1");

  // Stream or buffer depending on caller's request
  if (outgoing.stream === true) {
    // Pass through the SSE stream untouched.
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  }

  const text = await upstream.text();
  const sanitizedText = sanitizeUpstreamText(text);
  // Ensure JSON content-type for non-streamed responses
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  return new Response(sanitizedText, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
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
