/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],

  theme: {
    extend: {
      colors: {
        blue: {
          100: "hsl(215, 100%, 57%)",
          200: "hsl(215, 100%, 50%)",
        },
      },
    },
  },
  plugins: [],
};
