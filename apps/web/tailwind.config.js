/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-mono)", "monospace"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        oc: {
          black:   "#0A0A0A",
          text:    "#2B2B2B",
          muted:   "#6B6B6B",
          gray:    "#8E8B8B",
          light:   "#BCBBBB",
          lighter: "#CFCECD",
          lightest:"#DAD9D9",
          border:  "#E8E7E7",
          bg:      "#F7F6F6",
        },
      },
    },
  },
  plugins: [],
}
