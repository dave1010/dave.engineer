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
          '"Poppins"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
      },
      boxShadow: {
        "2xl": "0 25px 50px -12px rgba(15, 23, 42, 0.45)",
      },
      backgroundImage: {
        "grid-slate":
          "linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)",
        "glow-conic":
          "conic-gradient(from 180deg at 50% 50%, rgba(56, 189, 248, 0.28), rgba(236, 72, 153, 0.4), rgba(56, 189, 248, 0.28))",
      },
      keyframes: {
        aurora: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(0, -18px, 0) scale(1.05)" },
        },
        pulseLine: {
          "0%": { opacity: "0", transform: "translateX(-10%)" },
          "40%": { opacity: "0.3" },
          "100%": { opacity: "0", transform: "translateX(120%)" },
        },
      },
      animation: {
        aurora: "aurora 18s ease-in-out infinite",
        float: "float 20s ease-in-out infinite",
        "float-slow": "float 28s ease-in-out infinite",
        "pulse-line": "pulseLine 14s linear infinite",
      },
    },
  },
  plugins: [typography],
};
