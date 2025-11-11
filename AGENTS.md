# Coding agent notes

- Eleventy sources live in `content/`; layouts resolve to `src/layouts` and components/macros share that namespace.
- Markdown posts belong under `content/blog/`, eg `content/blog/posts/YYYY/MM/slug.md`; listing pages pull from Eleventy's collection API (see `content/blog/*.md`). When linking to published posts, use the clean `/blog/YYYY/MM/slug/` URL structure (no `/posts` segment).
- Tailwind styles are composed in `src/styles/tailwind.css`; build artifacts expect PostCSS via the existing npm scripts.
- Static assets in `public/` are passthrough-copied verbatim by `eleventy.config.js`—only keep files referenced by the site; prune stale icons instead of archiving them there.
- Syntax highlighting uses the official `@11ty/eleventy-plugin-syntaxhighlight` and Prism styles in `src/styles/prism.css`.
- Use the Biome toolchain for linting and formatting (`npm run lint`, `npm run format`, or `npm run check`) before committing JS/MD changes; the configuration lives in `biome.json`, and CI will fail if `npm run check` does not pass.
- GitHub Actions (`.github/workflows/test.yml`) runs `npm run check` and `npm test` on pushes and pull requests—keep those commands green locally.
- Utility JavaScript helpers belong under `src/` (for example `src/slugify.js`); avoid recreating a top-level `scripts/` directory.
- Python ingestion tools now live in `src/python/`.

<skills>

## Skills

You have new skills. If any skill might be relevant then you MUST read it.

- [writing-skills](.skills/writing-skills/SKILL.md) - Use when creating or updating SKILL.md documentation - Explains how and why to create a skill.
</skills>
