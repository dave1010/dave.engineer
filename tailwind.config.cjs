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
          '"Space Grotesk"',
          '"Poppins"',
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
      },
      boxShadow: {
        "2xl": "0 25px 50px -12px rgba(15, 23, 42, 0.45)",
        glow: "0 0 30px rgba(125, 90, 240, 0.35)",
      },
      backgroundImage: {
        "grid-glow": "linear-gradient(115deg, rgba(125,90,240,0.22) 0%, rgba(19,194,194,0.12) 35%, rgba(25,255,182,0.08) 100%)",
        "hero-radial": "radial-gradient(circle at top, rgba(125, 90, 240, 0.3), rgba(9, 9, 17, 0.9))",
      },
      animation: {
        "pulse-slow": "pulseSlow 6s ease-in-out infinite",
        "float": "float 12s ease-in-out infinite",
        "grid-shift": "gridShift 18s linear infinite",
      },
      keyframes: {
        pulseSlow: {
          "0%, 100%": { opacity: 0.7 },
          "50%": { opacity: 1 },
        },
        float: {
          "0%": { transform: "translate3d(-1%, 0, 0) rotate(-1deg)" },
          "50%": { transform: "translate3d(1%, -4%, 0) rotate(1deg)" },
          "100%": { transform: "translate3d(-1%, 0, 0) rotate(-1deg)" },
        },
        gridShift: {
          "0%": { backgroundPosition: "0 0, 0 0" },
          "50%": { backgroundPosition: "40px 20px, 20px 40px" },
          "100%": { backgroundPosition: "0 0, 0 0" },
        },
      },
    },
  },
  plugins: [typography],
};
