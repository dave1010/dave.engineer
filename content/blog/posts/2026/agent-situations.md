---
title: "Giving coding agents situational awareness (from shell prompts to agent prompts)"
date: 2026-01-11
tags:
  - ai
  - agents
  - coding
  - jorin
---

Coding agents are typically given static context for dynamic environments. This post explores a new idea on how to give _adaptive_ context to a coding agent in an extensible way.

Imagine a hybrid of Claude Code's `SKILL.md` convention with your shell's `PS1` prompt.

If you want to just straight to the code: I've implemented this in my coding agent [Jorin](https://github.com/dave1010/jorin) as a proof of concept and outlined a spec for [Agent Situations](https://github.com/dave1010/agent-situations) that other agents can use.

## Shell prompts as dynamic context

Prompts are the bits of information your shell gives you before you type a command. If you said you were "prompt engineering" a few years ago, that used to mean fiddling with ANSI character codes to get a really cool prompt in your terminal.

If you start working on any coding project, chances are, the first thing you'll see is something like this in your terminal:

```
[dave@laptop my-project]$
```

You might have set up your shell prompts `PS1` to give you more context. Here's mine:

```
➜  my-project git:(main) ✗
```

**My shell gives me, a biological coding agent, this context.**

This tells me the current working directory, whether the last command was successful (exit code of 0), the git branch and whether the git working tree is clean.

Thanks to this dynamic context, I rarely get mixed up about what directory I'm in or what git branch is checked out. It also saves me from needing to type `pwd` and `git status` every few seconds.

My prompt came out the box with Oh My Zsh. It isn't especially advanced. If I wanted more information  then I could install extra plugins or mess with config files. I could even use something like [Starship](https://starship.rs/) and use modules to show all sorts of useful context, like Node.js version, AWS region and laptop battery.

The shell works out this information automatically in milliseconds, based on the filesystem and current environment. The shell will update this every time you press Enter. It might cache some information and it will know which files to watch for changes, so your prompt doesn't take ages to load all the time.

The balance here is not overloading the prompt with more information than is useful. I've seen some multi-line prompts which look like they just add noise to the task at hand.

## Anti-drift

What's great about shell prompts is that they're always up to date. Running `git switch feature/foo` will show I'm on the `feature/foo` branch immediately.

This contrasts with documentation, which needs to be manually updated every time something changes. If you're not meticulous with updating documentation then it becomes stale.

A project might say "requires Node.js v18" but the authoritative information in package.json might say it requires v22. **The README.md lies but my shell prompt always tells the truth.**

Not having documentation is an inconvenience and can slow down development but stale documentation can cause wrong decisions.

## AGENTS.md and hand crafted system prompts

Coding agent design and discourse seems to have forgotten some of the things we take for granted with our dynamic shell prompts.

Most agents have convened on an [AGENTS.md](https://agents.md) file, which is like a static README.md but for AI to read instead of humans.

AGENTS.md gets fed into the LLM as a system or developer prompt. This is great for things that a README.md is great at but bad for things that a README.md is bad at.

Every time the project changes, I (or the agent) has to manually edit AGENTS.md.

*(Aside: in early 2026, we treat humans and agents as needing different sources of truth, [which I find odd](https://github.com/agentsmd/agents.md/issues/59).)*

An agent's system prompt can include more than just static text. A few months ago, Anthropic came up with Skills for Claude Code. Skills are like a table of contents, where the agent can decide if it wants to open a file to read a chapter or not.

I've trivialised them here but Skills are actually pretty cool. I wrote about them [here](https://dave.engineer/blog/2025/11/skills-to-agents/)
and support them in my coding agent, Jorin. In fact, Jorin even has a [Skill specifically for writing Situations](https://github.com/dave1010/jorin/blob/main/.jorin/skills/situations/SKILL.md).

Anthropic have shown how **simple pluggable extensions to the system prompt can be very effective**.

But the table of contents and the chapters themselves are still static. If you've installed a React skill for example, you either have to enable it manually per project, or an agent gets told "read skills/react/SKILL.md to learn about React" even if it's not a React project at all. Skills are great for _discovery_ but not necessarily for _relevance_.

## Situations (Dynamic Context Engineering)

**Situations are executable, self-selecting fragments of system prompt context.**

By now you might see where this is going: combining ideas from how we use shell prompts to determine context, with the extensible system prompt idea from Claude's Skills.

I'm calling these **Situations**. This hopefully makes it clearer that they're ephemeral and context specific. Situations are evaluated automatically. If they apply, they inject context; if not, they disappear.

Just like your shell checks `git status` before rendering the prompt in your terminal, a Situation does the same before generating the agent's system prompt.

Let's jump into how an MVP would work:

1. Loop through all registered Situations
2. Check each Situation
3. Only if the Situation is applicable then its context is given to the agent. Otherwise it leaves no trace.

Situations live in a `situations` directory and come with a `SITUATION.yaml` metadata file.

The "check" is quite different from Skills, which are manually enabled and disabled. Situations are executed automatically and they decide whether they apply.

Checks are defined in the YAML and could be:

- presence of files (eg tsconfig.json)
- presence of strings or a regex in files
- determined from environment variables
- the exit code when running an executable Situation

For now, I've only implemented executable Situations in Jorin. These are the most powerful, but also require the most trust to run.

Importantly, if the check fails then the context is not loaded at all. This is a big advantage over Skills, which are always loaded. Being selective means that Situations can afford to give more information up front and don't rely on the agent deciding to read more.

Context can be generated by:

- a static file (similar to SKILLS.md)
- a map of matched regex values to strings
- output from an executable

Here's an example Situation, which helps Jorin know which commands it can use. This prevents the agent from attempting to use tools that don’t exist, without bloating the prompt with universal assumptions.

```yaml
name: execs
description: Report common executables available on PATH.
run: run
```

Here, the `run` property means that Jorin should execute `run` as the check and append its output to the system prompt. Here's the `run` executable, which sits in the same directory:

{% raw %}
```bash
#!/usr/bin/env bash
set -euo pipefail

tools_list=(ag rg git gh go gofmt docker fzf python python3 php curl wget)
found=()

for tool in "${tools_list[@]}"; do
  if command -v "${tool}" >/dev/null 2>&1; then
    found+=("${tool}")
  fi
done

if [[ ${#found[@]} -gt 0 ]]; then
  joined=$(IFS=,; echo "${found[*]}")
  echo "Tools on PATH (others will exist too): ${joined}"
  exit 0
fi

joined=$(IFS=,; echo "${tools_list[*]}")
echo "Tools on PATH: none of ${joined}"
```
{% endraw %}

You could easily make Situations for things like:

- language or framework version, reminding the LLM of key features it can or can't use
- whether the build is currently passing
- extensive git information 
- available task runner tasks or build targets

## Beyond MVP

This is already working well in Jorin but it could do with:

- caching (checks are run each time)
- better installation and discovery of third party Situations
- battle testing different types of Situation checks

Jorin is where I've implemented this to try it out but I don't use Jorin as my day-to-day agent, so I'm hoping that other agents implement this or something similar. I've extracted the specification and a library of common Situations to [dave1010/agent-situations](https://github.com/dave1010/agent-situations), licensed CC0 (public domain). I invite other agent developers to experiment with it and consider adopting this standard.

Shell autocompletions may be another example of this pattern of executable, contextual affordances and worth exploring as a further input to agent context.
