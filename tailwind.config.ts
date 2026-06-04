import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          DEFAULT: "#0052ff",
          h: "#578bfa",
          soft: "rgba(0,82,255,.08)",
        },
        bg: "#f8f9fa",
        surface: "#eef0f3",
        cream: "#FBF8F1",
        mint: "#F1F7F3",
        lavender: "#F4F2FA",
        sand: "#F6F2EC",
        "near-black": "#0F172A",
        "dark-card": "#1E293B",
        "dark-border": "rgba(255,255,255,.07)",
        text: {
          DEFAULT: "#0a0b0d",
          2: "#5b616e",
          3: "#9aa0ae",
        },
        border: {
          DEFAULT: "rgba(91,97,110,.18)",
          2: "rgba(91,97,110,.28)",
        },
        green: {
          DEFAULT: "#16a34a",
          bg: "#f0fdf4",
          border: "#bbf7d0",
        },
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "12px",
        lg: "20px",
        pill: "100px",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
      },
      boxShadow: {
        sm: "0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04)",
        DEFAULT: "0 4px 16px rgba(0,0,0,.08)",
        lg: "0 12px 40px rgba(0,0,0,.12)",
      },
      maxWidth: {
        page: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
