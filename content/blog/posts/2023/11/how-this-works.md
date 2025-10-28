---
title: "How til.dave.engineer works"
date: 2023-11-28
tags:
  - til
type: til
---
The site is a basic [Eleventy](https://www.11ty.dev/) site.
You can install with `npm install` and build with `npm run build`.
Use `npm run serve` for development.

Most of the code that turns the repo of markdown files into
a website is in [`.eleventy.js`](https://github.com/dave1010/til/blob/main/.eleventy.js).

It's hosted with Github Pages and gets built using a
[Github Action](https://github.com/dave1010/til/blob/main/.github/workflows/build.yml).

This was inspired by [Simon Willison's TIL](https://til.simonwillison.net/)
and [jbranchaud/til](https://github.com/jbranchaud/til).
