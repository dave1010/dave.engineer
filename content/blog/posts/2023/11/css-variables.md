---
title: "CSS Variables"
date: 2023-11-23
tags:
  - css
type: til
---
## Revisiting CSS: A Pleasant Surprise
I don't often write CSS. 
To my surprise, I discovered that modern CSS now has its own native variables, known as Custom Properties.
These are now widely supported across all major browsers (see the compatibility chart on [caniuse.com](https://caniuse.com/css-variables)).
Initially, I thought things like this were only available in pre-processors like Sass.


## Example
For instance, the colours for this web page. I used CSS variables to define a color scheme:


```css
:root {
    --color-midnight-blue: #10151e;
    --color-white: #d4d6e1;
}

body {
    background-color: var(--color-midnight-blue);
    color: var(--color-white);
}

pre {
    background-color: var(--color-white);
    color: var(--color-midnight-blue);
}
```

This not only makes the CSS more readable but also allows for easier theme management and dynamic styling.

They're not just for colours and could be used for:

- dimensions
- fonts
- complex calculated values
