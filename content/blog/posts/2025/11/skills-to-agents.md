---
title: "From Skills to Agents: Bridging Claude Skills and AGENTS.md"
date: 2025-11-01
tags:
  - ai
  - coding
  - github
  - coding-agents
---

Coding agents benefit from custom instructions and tools. The standard way to do this now is with an [`AGENTS.md`](https://agents.md/) file and [MCP servers](https://modelcontextprotocol.io/docs/getting-started/intro). You can quickly add dozens of useful MCP servers. But filling an LLM's context with all this information, when it isn’t always relevant, just adds noise and leaves the agent with less space to work on the actual problem.

In 2023, I made a coding agent called [Pandora](https://dave.engineer/work/pandora/) that worked around this with a top-level [`the-guide.txt`](https://github.com/dave1010/pandora/blob/main/the-guide.txt), given to the LLM along with an [index of other guide files](https://github.com/dave1010/pandora/tree/main/guides). These guides could be dropped in or even symlinked from elsewhere. The [code for this](https://github.com/dave1010/pandora/blob/main/api/getGuide.php) was terrible: worse than what you’d get from vibe coding with an agent today. But it worked! The guide system improved the agent substantially, but since it was early GPT-4 era, it was still less capable than coding agents in 2025.

In October 2025, Anthropic introduced [Claude Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview), which aim to solve pretty much the same issues. Anthropic’s solution is similar to Pandora but much better thought-through and robust. Instead of plain text guides, Anthropic went with `SKILL.md` files. These Markdown files have front matter for metadata and live in their own directories, which means they can also include scripts or data. Claude Code does some magic to parse these files, giving the agent just enough information to use them.

Claude also has tooling for managing Skills, making it easy to publish and reuse them across projects and teams. A popular collection is [Superpowers](https://github.com/obra/superpowers/tree/main), which includes skills for things like TDD and git work trees.

As [Simon Willison](https://simonwillison.net/2025/Oct/16/claude-skills/) says, Claude Skills are awesome. I agree but theyre not so useful at the moment, as they only work with Claude. There are open requests for `SKILL.md` support in other agents, such as [Codex CLI](https://github.com/openai/codex/issues/5291) and [Gemini CLI](https://github.com/google-gemini/gemini-cli/issues/11506). **Wouldn’t it be great if Skills worked with any coding agent, without needing official support?**

Having built Pandora, I knew it would be easy to compile Skills into a top-level `AGENTS.md` file. I did this manually as a proof of concept. Knowing it would work, I built **[Skills to Agents](https://github.com/dave1010/skills-to-agents)**, which automates keeping `AGENTS.md` in sync with your Skills.

The tool:

1. Looks for `.skills/*/SKILL.md` files
2. Parses the Markdown front matter
3. Compiles the data with a short preamble explaining Skills
4. Writes the data to `AGENTS.md` inside a `<skills>…</skills>` block

I’ve also published it as an [Action on the GitHub Marketplace](https://github.com/marketplace/actions/build-agents-md-from-skills), making it easy to use in any repo. Just add a `.github/workflows/update-agents-skills.yml` file:

```yaml
name: Update AGENTS skills list

on:
  push:
    branches:
      - main
    paths:
      - '.skills/**'
  workflow_dispatch:

jobs:
  update-agents-skills:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: dave1010/skills-to-agents@v1
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'chore: sync AGENTS skills list'
          file_pattern: AGENTS.md
```

You can see a working example in [`dave1010/tools`](https://github.com/dave1010/tools), with the generated [`AGENTS.md`](https://github.com/dave1010/tools/blob/main/AGENTS.md#skills) and the [list of skills](https://github.com/dave1010/tools/tree/main/.skills). Feel free to copy my meta [Skill writing skill](https://github.com/dave1010/tools/blob/main/.skills/writing-skills/SKILL.md) to get started.

Since releasing `skills-to-agents`, I’ve seen related work like [list-skills](https://www.robert-glaser.de/claude-skills-in-codex-cli/) (released two days ago), which does something similar but tells the agent to run a command to list Skills. The more dynamic approach great for managing lots of tools but I prefer having a static list ready from the start. My approach also works for agents without code-execution privileges.

As with ideas that quickly became conventions (like `AGENTS.md` and MCP), I expect most coding agents will soon support Skills out of the box. For now, [`skills-to-agents`](https://github.com/dave1010/skills-to-agents) is a simple and effective way to fill the gap. Give it a go and let ke know how you get on.
