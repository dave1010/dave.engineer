---
title: "Getting started with Amazon Lex"
date: 2023-11-27
tags:
  - aws
type: til
---
Today, I was setting up an [Amazon Lex](https://docs.aws.amazon.com/lex/) chatbot and came across a couple of challenges.

In simple terms, Amazon Lex is like a more structred version of ChatGPT.
It uses advanced natural language understanding (NLU) and automatic speech recognition (ASR) technologies.

This allows developers to create interactive  chatbots that can understand and respond to user input in a meaningful way.
What's useful about Lex over large language models like GPT and Llama is that it's much more structured and integrates seamlessly with other AWS services.

## Quick start

I started off from the [Create a bot from an example](https://docs.aws.amazon.com/lexv2/latest/dg/exercise-1.html) example, changing a few things as I went.

1. **Set Up Bot and Intents:** First, I set up a bot named and defined an intent. This involved understanding the purpose of the bot and what kinds of user interactions it should handle. I did this through the AWS console but you can do it from the AWS CLI.

2. **Develop Sample Utterances:** I then created sample phrases for the bot to pick up "I want to buy a widget" that would trigger the intent.

3. **Configure Slots and Responses:** Next, I configured slots for capturing user input (like the product) and crafted appropriate responses.

4. **Build and Test:** Finally, the bot was compiled and tested. I used commands like the one below to interact with the bot and refine its functionality.

```bash
aws lexv2-runtime recognize-text --bot-id SJUDNSMPVC --bot-alias-id TestAlias --locale-id 'en_GB' --session-id 'testsession' --text "I want to buy a widget"
```

## Challenges
Developing a conversational AI isn't without its challenges. Here are a few I encountered:

- **Bot Publishing Workflow:** The process has several steps, but it's efficient once you get the hang of it.
- **IDs and Aliases:** It's crucial to keep track of different IDs and aliases to ensure everything functions correctly. Some commands take the bot ID, others take the alias. You'll get errors if you get them the wrong way round.
- **Formatting with Placeholders:** I learned that placeholders in utterances need proper spacing to work effectively. For instance, ` {product} ` must have spaces around it.

## Debugging

You can get your bot IDs and then their aliases like this:

```bash
aws lexv2-models list-bots
aws lexv2-models list-bot-aliases --bot-id SJUDNSMPVC
```
