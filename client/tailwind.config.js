/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],

  theme: {
    extend: {
      colors: {
        neutral: {
          100: "hsl(0, 0%, 0%)",
          200: "hsl(0, 0%, 93%)",
          300: "hsl(0, 0%, 100%)",
        },
        blue: {
          100: "hsl(215, 100%, 57%)",
          200: "hsl(227, 72%, 50%)",
        },
      },
    },
  },
  plugins: [],
};
