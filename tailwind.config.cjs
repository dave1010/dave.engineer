const typography = require("@tailwindcss/typography");

module.exports = {
  content: [
    "./content/**/*.{njk,html,md}",
    "./src/layouts/**/*.{njk,html}",
    "./src/components/**/*.{njk,html}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"IBM Plex Sans"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
        mono: [
          '"IBM Plex Mono"',
          '"Space Mono"',
          '"SFMono-Regular"',
          '"Menlo"',
          '"Monaco"',
          '"Consolas"',
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
        serif: ['"IBM Plex Serif"', "ui-serif", "Georgia", "serif"],
      },
    },
  },
  plugins: [typography],
};
