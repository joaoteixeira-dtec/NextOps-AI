/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Arial",
          "Noto Sans",
          "sans-serif"
        ],
      },
      colors: {
        ink: {
          950: "#050810",
          900: "#080D1C",
          800: "#0E1730",
          700: "#13204A"
        },
        accent: {
          blue: "#6366f1",
          cyan: "#22d3ee",
          emerald: "#34d399",
          violet: "#a78bfa",
          fuchsia: "#e879f9",
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.25)",
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 30px 80px rgba(0,0,0,0.35)",
        "glow-sm": "0 0 20px rgba(99,102,241,0.15)",
        "glow-lg": "0 0 60px rgba(99,102,241,0.2), 0 0 120px rgba(139,92,246,0.1)",
      },
      animation: {
        "shimmer": "shimmer 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-slower": "float 10s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "rotate-gradient": "rotate-gradient 4s linear infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
        "border-flow": "border-flow 3s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { backgroundPosition: "200% center" },
          "50%": { backgroundPosition: "-200% center" },
        },
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -12px, 0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        "rotate-gradient": {
          "0%": { "--angle": "0deg" },
          "100%": { "--angle": "360deg" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "border-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      backdropBlur: {
        "2xl": "40px",
        "3xl": "64px",
      },
    },
  },
  plugins: [],
};
