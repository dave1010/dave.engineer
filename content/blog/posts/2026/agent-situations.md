---
title: "Giving agents situational awareness: from shell prompts to agent prompts"
date: 2026-01-11
tags:
  - ai
  - agents
  - coding
  - jorin
---

This post explores a (potentially) new idea on how to give real time context to a coding agent in an extensible way.

Imagine a hybrid of Claude Code's `SKILL.md` convention with your shell's `PS1` prompt.

I've implemented this in my coding agent Jorin https://github.com/dave1010/jorin as a proof of concept.

## Prompt Engineering

Prompts are the bits of information your shell gives you before you type a command. Prompt engineering used to mean fiddling with ANSI character codes to get a really cool prompt in your terminal.

If you start working on any coding project, chances are, the first thing you'll see is something like this in your terminal:

```
[dave@laptop my-project]$
```

You might have set up your shell prompts `PS1` to give you more context. Here's mine:

```
➜  my-project git:(main) ✗
```

This tells me the current working directory, whether the last command was successful (exit code of 0), the git branch and whether the git working tree is clean.

My shell gives me (a biological coding agent) this context, so I don't need to type `pwd` and `git status` every few seconds.

My prompt came out the box with Oh My Zsh. It isn't especially advanced. If I wanted more information  then I could install extra plugins or mess with config files. I could even use something like [Starship](https://starship.rs/) and use modules to show all sorts of useful context, like Node.js version, AWS region and laptop battery.

The shell works out this information automatically in milliseconds, based on the filesystem and current environment. The shell will update this every time you press Enter. It might cache some information and it will know which files to watch for changes, so your prompt doesn't take ages to load all the time.

The balance here is not overloading the prompt with more information than is useful. I've seen some multi-line prompts which looks like they just add noise to the task at hand.

## Anti-drift

What's great about shell prompts is that they're always up to date. Running `git switch feature/foo` will show I'm on the `feature/foo` branch immediately.

This contrasts with documentation, which needs to be manually updated every time something changes.  A project might say "requires Node.js v18" but the authoritative information in package.json might say it requires v22. The README.md lies but my shell prompt always tells the truth.

## AGENTS.md and hand crafted system prompts

Coding agent design seems to have forgotten some of the things we take for granted with our dynamic shell prompts.

AGENTS.md is like a static README.md but for AI to read instead of humans.

AGENTS.md gets fed into the LLM as a system or developer prompt. This is great for things that a README.md is great at but bad for things that a README.md is bad at.

Every time the project changes, I (or the agent) has to manually edit AGENTS.md.

(Aside:

Even though we're training AI to perform like (super)humans, we think that they can't handle README.md and that we need to put extra care into telling AI about our projects in an AGENTS.md file. You can do `ln -s README.md AGENTS.md` if you want. That way you're forced to consider humans as well as AI. Or if you're only using agents for coding  - as is typical in early 2026 - you can do `ln -s CODING.md AGENTS.md`.
)

An agent's system prompt can include more than just static text. A few months ago, Anthropic came up with Skills for Claude Code. Skills are like a table of contents, where the agent can decide if it wants to open a file to read a chapter or not.

I've trivialised them here but Skills are actually pretty cool. I wrote about them here https://dave.engineer/blog/2025/11/skills-to-agents/
and support them in my coding agent, Jorin.

Anthropic have shown how simple pluggable extensions to the system prompt can be very effective.

But the table of contents and the chapters themselves are still static. If you've installed a React skill for example, you either have to enable it manually per project, or an agent gets told "read skills/react/SKILL.md to learn about React" even if it's not a React project at all.

## Situations (Dynamic Context Engineering)

By now you might see where this is going: combining ideas from how we use shell prompts to determine context, with the extensible system prompt idea from Claude's Skills.

I'm calling these **Situations**. This hopefully makes it clearer that they're ephemeral and context specific. "Context Engineering" was the 

Just like your shell checks `git status` before rendering the prompt in your terminal, a Situation does the same before generating the agent's system prompt.

Let's jump into how an MVP would work:

1. Loop through all registered Situations
2. Check each Situation
3. If the situation is applicable then append its context to the system prompt

Situations like in a `situations` directory and come with a `SITUATION.yaml` metadata file.

The "check" is quite different from Skills, which are manually enabled and disabled. Situations are executed automatically and they decide whether they apply.

Checks are defined in the YAML and could be:

- presence of files (eg tsconfig.json)
- presence of strings or a regex in files
- determined from environment variables
- the exit code when running an executable Situation

For now, I've only implemented executable Situations in Jorin. This are the most powerful, but also require the most trust to run.

Importantly, if the check fails then the context is not loaded at all. This is a big advantage over Skills, which are always loaded. Being selective means that Situations can afford to give more information up front and don't rely on the agent deciding to read more.

Context can be generated by:

- a static file (similar to SKILLS.md)
- a map of matched regex values to strings
- output from an executable

Here's an example Situation, which helps Jorin know which commands it can use.

```yaml
name: execs
description: Report common executables available on PATH.
run: run
```

Here, the `run` property means that Jorin should execute `run` as the check and append its output to the system prompt. Here's the `run` executable, which sits in the same directory:

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

## Beyond MVP

This is already working well in Jorin but it could do with:

- caching (checks are ran each time)
- better installation and discovery of third party Situations
- battle testing different types of Situation checks

Jorin is where I've implemented this to try it out but I don't use Jorin as my day-to-day agent, so I'm hoping that other agents implement this or something similar. I've extracted the specification and a library of common situations to [dave1010/agent-situations], licensed CC0 (public domain). I invite other agent developers to iterate and adopt this standard.

I also wonder whether shell auto completions serve a similar problem and whether they could be integrated somehow.

## Ideas for Situations

- detect language or framework version and remind the LLM of key features it can or can't use
- whether the build is currently passing
- extensive git information 
- task runner tasks or build targets
