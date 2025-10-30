# Coding agent notes

- Eleventy sources live in `content/`; layouts resolve to `src/layouts` and components/macros share that namespace.
- Markdown posts belong under `content/blog/`; listing pages pull from Eleventy's collection API (see `content/blog/*.md`). When linking to published posts, use the clean `/blog/YYYY/MM/slug/` URL structure (no `/posts` segment).
- Tailwind styles are composed in `src/styles/tailwind.css`; build artifacts expect PostCSS via the existing npm scripts.
- Static assets in `public/` are passthrough-copied verbatim by `eleventy.config.js`—drop compiled output there when tooling can't run inside Eleventy.
- Syntax highlighting uses the official `@11ty/eleventy-plugin-syntaxhighlight`; remember to add matching Prism styles in `src/styles/prism.css` when introducing new languages.
- Use the Biome toolchain for linting and formatting (`npm run lint`, `npm run format`, or `npm run check`) before committing JS/MD changes; the configuration lives in `biome.json`.
