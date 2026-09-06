const terminalForm = document.querySelector("[data-terminal-form]");

if (terminalForm) {
  const terminalInput = terminalForm.querySelector("[data-terminal-input]");
  const terminalOutput = document.querySelector("[data-terminal-output]");
  const terminalPanel = terminalForm.closest("[data-terminal-root]");

  if (terminalInput instanceof HTMLInputElement && terminalOutput instanceof HTMLElement) {
    const conversation = [
      { role: "user", content: "ls" },
      { role: "assistant", content: "hello.txt\nindex.md" },
    ];
    const MAX_HISTORY = 50;

    const trimConversation = () => {
      if (conversation.length > MAX_HISTORY) {
        conversation.splice(0, conversation.length - MAX_HISTORY);
      }
    };

    const scrollToBottom = () => {
      window.requestAnimationFrame(() => {
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        const parent = terminalOutput.parentElement;
        if (parent) parent.scrollTop = parent.scrollHeight;
      });
    };

    const focusInput = () => {
      if (terminalInput.disabled) return;
      window.requestAnimationFrame(() => {
        if (!terminalInput.disabled) {
          terminalInput.focus();
        }
      });
    };

    if (terminalPanel instanceof HTMLElement) {
      terminalPanel.addEventListener("pointerup", (event) => {
        if (!(event.target instanceof HTMLElement)) return;
        if (event.target.closest("input, textarea, button, a")) return;
        const selection = window.getSelection();
        if (selection?.toString()) return;
        focusInput();
      });
    }

    const appendCommandLine = (command) => {
      const line = document.createElement("div");
      line.className = "terminal-line";

      const prompt = document.createElement("span");
      prompt.className = "terminal-line__prompt";
      prompt.textContent = "$";

      const commandSpan = document.createElement("span");
      commandSpan.className = "terminal-line__command";
      commandSpan.textContent = command;

      line.append(prompt, commandSpan);
      terminalOutput.append(line);
      scrollToBottom();
      return line;
    };

    const appendBlock = (text, extraClass) => {
      const block = document.createElement("pre");
      block.className = "terminal-block";
      if (extraClass) block.classList.add(extraClass);
      block.textContent = text;
      terminalOutput.append(block);
      scrollToBottom();
      return block;
    };

    const parseResponsePayload = (raw, response) => {
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = raw;
      }

      if (!response.ok) {
        const message =
          typeof parsed === "string"
            ? parsed
            : parsed?.error || parsed?.message || `Request failed (${response.status})`;
        throw new Error(typeof message === "string" ? message : String(message));
      }

      if (typeof parsed === "string") {
        return parsed;
      }

      const assistantText = parsed?.choices?.[0]?.message?.content ?? parsed?.message ?? "";
      return typeof assistantText === "string" ? assistantText : String(assistantText ?? "");
    };

    terminalForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const command = terminalInput.value.trim();
      if (!command) {
        focusInput();
        return;
      }

      terminalInput.value = "";
      terminalInput.disabled = true;

      appendCommandLine(command);
      const pendingBlock = appendBlock("", "terminal-block--pending");
      pendingBlock.textContent = "▌";

      const payloadMessages = conversation
        .slice(-MAX_HISTORY)
        .concat({ role: "user", content: command });

      try {
        const response = await fetch("/terminal-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: payloadMessages }),
        });

        const raw = await response.text();
        const assistantReply = parseResponsePayload(raw, response);

        pendingBlock.classList.remove("terminal-block--pending");
        pendingBlock.textContent = assistantReply.trim();

        conversation.push({ role: "user", content: command });
        conversation.push({ role: "assistant", content: assistantReply });
        trimConversation();
      } catch (error) {
        pendingBlock.classList.remove("terminal-block--pending");
        pendingBlock.classList.add("terminal-block--error");
        pendingBlock.textContent =
          error instanceof Error ? `error: ${error.message}` : "error: unexpected failure";
      } finally {
        terminalInput.disabled = false;
        focusInput();
      }
    });
  }
}
