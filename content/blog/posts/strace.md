---
title: "Strace"
date: 2014-02-01
tags:
  - linux
---

Quick strace command that I use all the time to see what files a process is opening:

```sh
strace -f <command> 2>&1 | grep ^open
```

Really useful to see what config files something is reading (and the order) or to see what PHP (or similar) files are being included.

There’s normally other ways to do this (eg using a debugger) but sending strace’s stderr to stdout and piping through grep is useful in so many cases it’s become a command I use every day or 2.
