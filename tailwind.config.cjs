module.exports = {
  content: [
    "./content/**/*.{njk,html,md}",
    "./src/layouts/**/*.{njk,html}",
    "./src/components/**/*.{njk,html}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Poppins"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        '2xl': '0 25px 50px -12px rgba(15, 23, 42, 0.45)',
      },
    },
  },
  plugins: [],
};
