---
title: "Tidy up local and remote branches in git"
date: 2023-11-22
tags:
  - git
type: til
---
## Your remote tracking branches

This cleans up the big origin list you get when you do `git branch --remote`

```bash
git remote prune origin
```

## Local branches that have been merged

This removes your local branches that have been merged into the *current* branch.

```bash
git branch --merged | grep -v \* | xargs git branch -D
```


## Branches *on* the remote

Remove branches that have been merged on the remote (skipping `master`)

```bash
git branch -r --merged | grep -v master | sed 's/origin\///' | xargs -n 1 git push --delete origin
```

Or if you use `main`:

```bash
git branch -r --merged | grep -v main | sed 's/origin\///' | xargs -n 1 git push --delete origin
```

## Adding a `git` alias to do all this for you

Note: this assumes you're currently on `master`.

```bash
git config --global alias.cleanup-merged '!f() { git remote prune origin; git branch --merged | grep -v \* | xargs -I {} git branch -D {}; git branch -r --merged | grep -v master | sed "s/origin\///" | xargs -n 1 git push --delete origin; }; f'
```
