---
title: "Making a custom \"GPT\" for ChatGPT"
date: 2023-11-28
tags:
  - openai
type: til
---
First thing's first: GPT stands for Generative Pre-trained Transformer but for some reason OpenAI have reused the name for one of their products.

## What's a Generative Pre-trained Transformer really?

These are artifical neural networks that use the **Transformer** model: a highly parallel [attention](https://en.wikipedia.org/wiki/Attention_(machine_learning)) mechanism instead of 
being a looping sequential [Recurrent Neural Network](https://en.wikipedia.org/wiki/Recurrent_neural_network) or a grid-like [Convolutional Neural Network](https://en.wikipedia.org/wiki/Convolutional_neural_network).

A GPT is **pre-trained** on lots of unlabeled data, so it's unsupervised.

And it's **generative** because it can generate content, rather than only being able to classify or encode.

## Custom GPTs for use with ChatGPT

[Open API introduced GPTs](https://openai.com/blog/introducing-gpts) on 6th November 2023. The most basic ones are nothing more than:

- a system prompt
- a logo and a description

More complex ones can also include:

- data you upload. Presumably this gets turned into embeddings and is accessible to ChatGPT via a vector database.
- API access, just like ChatGPT Plugins

## Making a basic GPT

Making a GPT takes literally a minute or 2:

1. Go to the [GPT editor](https://chat.openai.com/gpts/editor)
2. Do what ChatGPT tells you to do:
    - give an overview
    - agree to a generated logo
    - refine it

Have a go, as it's so easy.

## Example: [Fast GPT ⚡](https://chat.openai.com/g/g-VnlKc5BQK-fastgpt)

GPT-4 can be annoyingly slow. When it waffles then its slowness is even more aparent.

I made a GPT called [Fast GPT ⚡](https://chat.openai.com/g/g-VnlKc5BQK-fastgpt), which is designed to cut out all the waffle
and get straight to the point. It works surprisingly effectively.

Here's the prompt it uses:

```
FastGPT's tone is very very terse and strictly to the point.
Be incredibly careful to ensure there are no unnecessary words at all.
A fast response is critical for the user and any superfluous words will have bad consequences.
This is paramount. No pleasantries. No apologising. Use very short words.
No code comments. Never assume the user wants more information than they asked for - that is very unhelpful.
If the user sends a message with just "?" then add more detail to your previous response,
being as helpful as possible but still without unnecessary words.
Multiple "?" means more verbose.
```

## How GPTs work

OpenAI include the GPT prompt as part of the *system prompt* used when you converse with ChatGPT.
Similar to custom instructions, this means that you can modify ChatGPT's system prompt,
without having to use the [OpenAI Playground](https://platform.openai.com/playground),
third party tools or directly access the API.

ChatGPT is given the default system prompt (including how to use tools like DALL-E, its knowledge cutoff and the current date),
followed by this, then your GPT's prompt:

> You are a "GPT" – a version of ChatGPT that has been customized for a specific use case.
> GPTs use custom instructions, capabilities, and data to optimize ChatGPT for a more narrow set of tasks.
> You yourself are a GPT created by a user, and your name is [name].
> Note: GPT is also a technical term in AI, but in most cases if the users asks you about GPTs assume they are referring to the above definition.
> Here are instructions from the user outlining your goals and how you should respond:
