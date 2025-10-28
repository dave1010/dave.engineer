---
title: "Making JavaScript Behave Like Python for Script and Module Distinctions with Bun"
date: 2024-04-21
tags:
  - javascript
type: til
---
While working on a JavaScript project using the `chalk` library to stylize terminal output, I found an interesting thing about handling JavaScript files as both importable modules and executable scripts, much like Python's `if __name__ == "__main__"`.

I wanted to be able to quickly test and debug a module like this:

```bash
bun run src/util/styles.ts
# shows helpful debug info

bun run src/index.ts
# imports src/util/styles.ts but doesn't show debugging info
```

## The Solution
Here's the code that makes it work:

```javascript
import chalk from 'chalk';

const styles = {
    error: chalk.bold.underline.red,
    warning: chalk.italic.inverse.hex('#FFA500'),
    info: chalk.blue
};

// Ensuring the file behaves as intended when compiled with Bun
if (import.meta.main && import.meta.file === 'chalkStyles.ts') {
    // Demonstrating the styles in the console
    for (const [styleName, style] of Object.entries(styles)) {
        console.log(`${style('This is a test!')}\t${styleName}`);
    }
}

export default styles;
```

### Background
In Python, it's common to use `if __name__ == "__main__"` to determine whether a script is being run standalone or being imported. I wanted to achieve something similar in JavaScript to allow for both importing styles for use in other parts of an application and running the script directly to test the styles.

### The JavaScript Way
In JavaScript, especially when using ES Modules, you can use [`import.meta.main`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta). This property is true if the script is run directly, which seemed like the perfect counterpart to Python’s approach.

However, when I was compiling my JavaScript code using [Bun](https://bun.sh/) (a modern JavaScript runtime like Node.js), just using `import.meta.main` wasn't sufficient due to the way Bun handles module compilation.

To accurately determine the context when compiled, I added an extra check: `import.meta.file === 'styles.ts'`. This check ensures that not only is the file executed as the main entry point, but it is also specifically the `chalkStyles.ts` file, avoiding any misinterpretation when multiple files are involved in the compilation.

Implementing this dual check allowed me to flexibly use the `styles` module while quickly testing it as a standalone script.
