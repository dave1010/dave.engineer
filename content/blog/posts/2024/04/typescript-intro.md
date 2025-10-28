---
title: "Introduction to TypeScript"
date: 2024-04-22
tags:
  - javascript
type: til
---
I recently started work on a new project and started transitioning the JavaScript into TypeScript, so thought I'd write some notes.

TypeScript is made by Microsoft and basically enhances JavaScript by adding a whole load of language features relating to types.

### Why TypeScript?

The main advantage of TypeScript is its ability to define types for variables and function parameters. This capability helps you ensure code behaves as expected without needing to perform lots of manual tests or debug runtime issues.

If you're used to having the type safety of languages like Kotlin or Swift then TypeScript will be a welcome improvement over plain JavaScript.

The coolest thing about TypeScript is that it's a superset of JavaScript. This means that your JS code is already TS! You can incrementally add types and other TypeScript syntax as you go along. Just rename your `.js` file to `.ts`.

### A Simple Example

Here’s a quick TypeScript snippet demonstrating a function with typed parameters and return type:

```typescript
function greet(person: string, date: Date): string {
    return `Hello ${person}, today is ${date.toDateString()}!`;
}

console.log(greet("Dave", new Date()));
```

TypeScript has other features too, like enums, tuples and generics.

### Setting Up TypeScript

To get started with TypeScript, install it via npm, initialize a new project, and start converting your JavaScript files to TypeScript files:

```bash
npm install -g typescript
tsc --init
```

This will create a new `tsconfig.json` file. You can edit your `tsconfig.json` to set up the compiler options suited for your project, and run `tsc` to compile your TypeScript code to JavaScript.
