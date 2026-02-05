---
layout: page.njk
sectionLabel: "Uses"
title: "Uses"
description: "The tools, services, and conventions that keep this site running."
---

This page documents the stack and tooling behind the site so it’s easy to maintain or rebuild.

## Site stack

- **Eleventy** for static site generation.
- **Nunjucks** templates, markdown content, and collections.
- **Tailwind CSS** for styling and layout.
- **Prism** syntax highlighting via the Eleventy plugin.
- **RSS** via `/feed.xml` for subscriptions.

## Workflow

- **Biome** for formatting and linting.
- **GitHub Actions** to keep checks and tests green.
- **Passthrough assets** in `public/` for icons, manifest files, and media.
