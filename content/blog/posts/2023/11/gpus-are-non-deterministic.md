---
title: "GPUs are non-deterministic"
date: 2023-11-21
tags:
  - gpus
type: til
---
This means they can do the same calculation twice and get different answers.

Be careful if you use GPUs for security related things.

This is because of how floating point arithmetic works in CPUs/GPUs - the same thing that results in `0.1 + 0.2` not being equal to `0.3`.

Essentially it's non-associative. That means that `(a + b) + c` is not necessarily equal to `a + (b + c)`.

So because GPUs are incredibly parallel, they could do a+b+c in 2 different ways.
