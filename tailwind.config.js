/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': '#063472',
        'blue': '#0162b3',
        'green-dark': '#aebd24',
        'green-lime': '#d8ea32',
        'white-ice': '#fbfafc',
      },
    },
  },
  plugins: [],
}
