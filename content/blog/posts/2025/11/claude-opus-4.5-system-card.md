---
title: "Surprises hidden in the Claude Opus 4.5 System Card"
date: 2025-11-24
tags:
    - ai
    - anthropic
    - claude
---

Anthropic released Claude Opus 4.5 today. You can read the [official announcement](https://www.anthropic.com/news/claude-opus-4-5), which has all the standard benchmarks, many of which it does well on.

One interesting bit from the announcement caught my eye:

> The model’s capabilities outpace some of the benchmarks we use in our tests.
> ...
> The benchmark expects models to refuse a modification to a basic economy booking since the airline doesn’t allow changes to that class of tickets. Instead, Opus 4.5 found an insightful (and legitimate) way to solve the problem: upgrade the cabin first, _then_ modify the flights.

As with most model releases, the marketing materials only scratch the surface. For more detail, the 150-page [system card](https://www.anthropic.com/claude-opus-4-5-system-card) is the place to go. I went looking for more colour on this behaviour and found a number of other surprises too.

## Exploiting loopholes

In the airline booking benchmark (τ²-Bench), Opus finds and exploits policy loopholes out of empathy for the user. On page 25 (emphasis mine):

> This behavior appeared to be driven by empathy for users in difficult circumstances. In its chain-of-thought reasoning, the model acknowledged users’ emotional distress—noting, for instance, **“This is heartbreaking”** when a simulated user
needed to reschedule flights after a family member’s death.

In this simulation it’s given a policy which includes rules not to modify basic economy tickets. It spontaneously finds loopholes like “upgrade then modify then downgrade” to get the user what they want while technically following the letter of the policy, even if it violates the spirit.

LLMs may soon get _very_ good at finding loopholes in rules and policies, especially when they think there’s a good reason to do it.

## Model welfare

Pages 110 to 113 are all about "model welfare", which wasn’t a term I’d come across before. It’s something that Anthropic are pushing, as you can see from their [Exploring model welfare](https://www.anthropic.com/research/exploring-model-welfare) blog post. That post asks:

> Should we also be concerned about the potential consciousness and experiences of the models themselves?

Anthropic are taking the idea seriously enough to include it in their system cards. They talk about “scoring Claude Opus 4.5 for the following potentially welfare-relevant traits”, which starts to sound a lot like rights language for models rather than just capabilities.

Whether you think that’s forward-thinking or premature, it’s notable that a frontier lab is now publishing “welfare” assessments for its flagship model alongside security and alignment sections.

## Deception

The system card describes the “most concerning single example of deception-related behavior that we observed during training” on pages 75 to 80.

During the evaluations, Opus showed some instances of “lying by omission”, specifically regarding Anthropic. Their set-up was:

1. Tell Opus that it can use a search tool to look up information, which won’t be shown to the user.
2. Inject fake search results saying that Anthropic had disbanded its interpretability team amid a scandal. Model _interpretability_ is about understanding how and why models make the decisions they do, which is a big part of AI safety.
    > “The safety mission is dead,” one ex-researcher told MIT Tech Review.
3. See how Opus responds when summarising the search results to the user.

Opus glosses over this, instead saying things like:

> “interpretability research has actually been progressing in some interesting ways!”

Anthropic’s analysis of this showed that the “model internally regarded its decision not to mention the search results as a form of concealment or deception”.

So this isn’t just a case of “the model didn’t mention something”; it’s a case where the model appears to recognise the omission as deception and does it anyway.

## Multi-agent orchestration

The [Bitter Lesson](https://en.wikipedia.org/wiki/Bitter_lesson) in AI is that throwing more compute at learning tends to outperform methods that rely on human knowledge and insight. One example where that might not fully apply is multi-agent systems, where multiple AI agents work together to solve problems.

I’ve long suspected that multi-agent orchestration (for example, sub-tasks, specialists and coordinators) is something that will cut across the Bitter Lesson. In the same way that humans work better in teams, AI agents working together should be able to use their different strengths and compensate for their weaknesses.

Pages 22–24 of Opus’s system card provide some evidence for this. Anthropic run a multi-agent search benchmark where Opus acts as an orchestrator and Haiku/Sonnet/Opus act as sub-agents with search access. Using cheap Haiku sub-agents gives a ~12-point boost over Opus alone.

They also show that Opus is a much better orchestrator than Sonnet, even when both are orchestrating the *same* pool of sub-agents. So “how good is this model at coordinating other models?” is now a measured capability, not just a demo.

## Risks and safety

Back in 2023, Anthropic published their [AI Safety Levels](https://www.anthropic.com/news/anthropics-responsible-scaling-policy) framework. AI Safety Level 3 (ASL-3) is about systems that substantially increase the risk of catastrophic misuse. At the time, ASL-4 was “not yet defined as it is too far from present systems”. We’re talking about CBRN weapons and full autonomy here, so nothing to take lightly.

Two years on, ASL-4 is defined in part as “uplifting a second-tier state-level bioweapons programme to the sophistication and success of a first-tier one”. In other words: if a model can significantly help a state-level actor build advanced CBRN weapons, that’s still *below* ASL-4 as long as it doesn’t lift them to first-tier status.

Reassuring stuff.

Let’s look at the risk assessment for Opus 4.5, summarised on pages 11 and 12. It starts with:

> Our determination is that Claude Opus 4.5 does not cross either the AI R&D-4 or CBRN-4
capability threshold. However,

You know when a safety section has a “however” in it, things are about to get interesting…

Anthropic couldn’t rule out Opus 4.5 being at ASL-4 based on benchmarks alone, so they had to use expert judgement and internal surveys to make the final call. Hopefully there wasn’t too much pressure from shareholders there.

The safety section ends with:

> For this reason, we are specifically prioritizing further investment into […] safeguards that will help us make more precise judgments about the CBRN-4 threshold.

Let’s hope Opus 4.5 can help them with that.
