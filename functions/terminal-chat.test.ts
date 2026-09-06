import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MAX_MESSAGE_LENGTH,
  onRequestPost,
  sanitizeUpstreamText,
  stripThinkingSegments,
  truncateContent,
} from "./terminal-chat";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("terminal chat helpers", () => {
  it("removes <think> segments from assistant output", () => {
    const input = "Hello <think>internal</think> world";
    expect(stripThinkingSegments(input)).toBe("Hello  world".trim());
  });

  it("truncates messages longer than the maximum length", () => {
    const repeated = "a".repeat(MAX_MESSAGE_LENGTH + 10);
    expect(truncateContent(repeated).length).toBe(MAX_MESSAGE_LENGTH);
  });

  it("returns the original payload when no sanitization is needed", () => {
    const json = JSON.stringify({ message: "clean" });
    expect(sanitizeUpstreamText(json)).toBe(json);
  });

  it("sanitizes a mixture of string and JSON payloads", () => {
    const raw = JSON.stringify({
      message: "Answer<think>plan</think>!",
      choices: [
        {
          text: "Raw<think>scratch</think> text",
          message: { content: "Visible<think>hidden</think> value" },
        },
        {
          message: { content: "Already clean" },
        },
      ],
      response: {
        output_text: ["Segment<think>analysis</think> one", "Segment two"],
      },
    });

    const sanitized = sanitizeUpstreamText(raw);
    const parsed = JSON.parse(sanitized) as Record<string, unknown>;

    expect(parsed.message).toBe("Answer!");
    const choices = parsed.choices as unknown[];
    expect(Array.isArray(choices)).toBe(true);

    const firstChoice = choices?.[0] as Record<string, unknown>;
    expect(firstChoice.text).toBe("Raw text");

    const firstMessage = (firstChoice.message as Record<string, unknown>).content;
    expect(firstMessage).toBe("Visible value");

    const response = parsed.response as { output_text: string[] };
    expect(response.output_text).toEqual(["Segment one", "Segment two"]);
  });

  it("sanitizes plain string payloads", () => {
    const raw = "Hello<think>trace</think> world";
    expect(sanitizeUpstreamText(raw)).toBe("Hello world");
  });

  it("proxies chat requests to Groq using the configured key and model", async () => {
    const upstreamFetch = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => {
      return new Response(JSON.stringify({ choices: [{ message: { content: "ok" } }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", upstreamFetch);

    const assetFetch = vi.fn(async () => {
      return new Response("Home page content", { status: 200 });
    });

    const response = await onRequestPost({
      request: new Request("https://dave.engineer/terminal-chat", {
        method: "POST",
        body: JSON.stringify({ messages: [{ role: "user", content: "echo hi" }] }),
      }),
      env: {
        ASSETS: { fetch: assetFetch },
        GROQ_API_KEY2: "test-groq-key",
      },
    } as Parameters<typeof onRequestPost>[0]);

    expect(response.status).toBe(200);
    expect(upstreamFetch).toHaveBeenCalledOnce();
    const [url, init] = upstreamFetch.mock.calls[0];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(init?.headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer test-groq-key",
    });

    const body = JSON.parse(String(init?.body)) as {
      model: string;
      messages: Array<{ role: string; content: string }>;
      stream: boolean;
    };
    expect(body.model).toBe("openai/gpt-oss-120b");
    expect(body.stream).toBe(false);
    expect(body.messages[body.messages.length - 1]).toEqual({
      role: "user",
      content: "echo hi",
    });
  });
});
