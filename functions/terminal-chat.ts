// functions/terminal-chat.ts
import type { PagesFunction } from "@cloudflare/workers-types";
import { TERMINAL_SYSTEM_PROMPT } from "./terminal-system-prompt";

type Env = {
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
    return json(
      { error: "Missing binding 'CEREBRAS_API_KEY' on this deployment." },
      500,
      {
        "X-Missing-Binding": "CEREBRAS_API_KEY",
      }
    );
  }

  const payload = await readJSON<ChatPayload>(request);
  if (!payload) {
    return json({ error: "Invalid JSON payload" }, 400);
  }

  const { messages } = payload;
  if (!Array.isArray(messages) || messages.length === 0) {
    return json(
      { error: "`messages` must be a non-empty array" },
      400
    );
  }

  const outgoingMessages: ChatMessage[] = [
    { role: "system", content: TERMINAL_SYSTEM_PROMPT },
  ];

  for (const entry of messages) {
    if (!entry || typeof entry !== "object") continue;
    const role = typeof (entry as Record<string, unknown>).role === "string"
      ? (entry as Record<string, unknown>).role.trim().toLowerCase()
      : "";
    const content = (entry as Record<string, unknown>).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string" || content.trim() === "") continue;

    outgoingMessages.push({
      role: role as "user" | "assistant",
      content,
    });
  }

  if (!outgoingMessages.some((msg) => msg.role === "user")) {
    return json({ error: "At least one user message is required" }, 400);
  }

  const outgoing: Record<string, unknown> = {
    model: "qwen-3-32b",
    messages: outgoingMessages,
    stream: false,
  };

  const apiURL = (env.CEREBRAS_API_URL?.trim() || DEFAULT_API_URL);

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
  // Ensure JSON content-type for non-streamed responses
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  return new Response(text, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
};

/* ---------- utils ---------- */
function json(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}
