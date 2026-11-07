/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cegak: {
          sky: "#86D2DC",      // Biru muda logo
          teal: "#11B5AE",     // Teal/green accent logo
          primary: "#11B5AE",  // Utama: Teal accent
          secondary: "#86D2DC",// Biru muda
          accent: "#11B5AE",
          deep: "#0F4643",     // Deep medical teal
          dark: "#0a3634",
          soft: "#EAF8F8",     // Soft ice blue/teal accent
          gray: "#F5F9F9",     // Fresh light background
          warning: "#E9A23B",  // Warning yellow/amber
          danger: "#DC4545",   // Danger red
          50: "#f0fbfb",
          100: "#dcf6f5",
          200: "#b5eeec",
          300: "#86D2DC",     // Dominasi warna biru muda
          400: "#44c6bf",
          500: "#11B5AE",     // Teal/green accent
          600: "#0e9690",
          700: "#0f7672",
          800: "#0F4643",
          900: "#093331",
        },
        brand: {
          50: "#f0fbfb",
          100: "#EAF8F8",
          200: "#d5f3f2",
          300: "#86D2DC",
          400: "#3ecac3",
          500: "#11B5AE",
          600: "#0e9690",
          700: "#0F4643",
          800: "#0c3a37",
          900: "#072422",
        },
        hospital: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#86D2DC",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
        }
      },
    },
  },
  plugins: [],
}
