import { describe, expect, it } from "vitest";
import {
  MAX_MESSAGE_LENGTH,
  sanitizeUpstreamText,
  stripThinkingSegments,
  truncateContent,
} from "./terminal-chat";

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
});
