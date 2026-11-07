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
          deep: "#153C35",     // Deep Green identity
          soft: "#E8F2ED",     // Soft Green accent
          gray: "#F5F7F6",     // Light Gray background
          warning: "#E9A23B",  // Warning yellow/amber
          danger: "#DC4545",   // Danger red
          50: "#e6f5f3",
          100: "#c0e6e1",
          500: "#008f7a",
          600: "#007a68",
          700: "#153C35",
          800: "#153C35",
          900: "#0c2420",
        },
        brand: {
          50: "#ecfdf5",
          100: "#E8F2ED",
          500: "#10b981",
          600: "#059669",
          700: "#153C35",
          800: "#153C35",
          900: "#0c2420",
        },
        hospital: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
        }
      },
    },
  },
  plugins: [],
}

