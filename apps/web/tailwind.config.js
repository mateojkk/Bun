/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)"],
        geist: ["var(--font-geist-sans)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        oc: {
          black:    "#000000", // Stark Black
          panel:    "#070707", // Near-black Panel
          ink:      "#ffffff", // Stark White Headings
          text:     "#e5e5e5", // Off-white Body
          muted:    "#888888", // Muted Gray Text
          gray:     "#a3a3a3", // Neutral Gray
          light:    "#d4d4d4", // Light gray
          lighter:  "#e5e5e5", 
          lightest: "#ffffff",
          border:   "#121212", // Stark Dark Border
          green:    "#00ff00", // Stark Neon Green
          blue:     "#00ff00", // Map secondary accent colors to Green to prevent multi-color clutter
          gold:     "#888888", // Map gold to neutral muted gray
          coral:    "#f43f5e", 
          bg:       "#000000",
        },
      },
    },
  },
  plugins: [],
}
