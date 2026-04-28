const terminalForm = document.querySelector("[data-terminal-form]");

if (terminalForm) {
  const terminalInput = terminalForm.querySelector("[data-terminal-input]");
  const terminalOutput = document.querySelector("[data-terminal-output]");

  if (terminalInput instanceof HTMLInputElement && terminalOutput instanceof HTMLElement) {
    const conversation = [
      { role: "user", content: "ls" },
      { role: "assistant", content: "hello.txt\nindex.md" },
    ];

    const renderLine = (line, className) => {
      const row = document.createElement("div");
      row.className = className;
      row.textContent = line;
      return row;
    };

    terminalForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const command = terminalInput.value.trim();
      if (!command) return;

      conversation.push({ role: "user", content: command });
      terminalOutput.append(renderLine(`$ ${command}`, "terminal-line"));
      terminalInput.value = "";

      terminalOutput.append(renderLine("Not enabled on this page.", "terminal-block"));
    });
  }
}
