/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Inter",
          "Arial",
          "Noto Sans",
          "sans-serif"
        ],
      },
      colors: {
        ink: {
          950: "#070A12",
          900: "#0A0F1E",
          800: "#101A33",
          700: "#15234A"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.25)",
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 30px 80px rgba(0,0,0,0.35)"
      }
    },
  },
  plugins: [],
};
