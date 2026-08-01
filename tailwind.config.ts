import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        secondaryBg: "var(--secondaryBg)",
        surface: "var(--surface)",
        elevatedSurface: "var(--elevatedSurface)",
        primaryText: "var(--primaryText)",
        secondaryText: "var(--secondaryText)",
        mutedText: "var(--mutedText)",
        border: "var(--border)",
        primaryAccent: "var(--primaryAccent)",
        primaryHover: "var(--primaryHover)",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        champagne: "#F9F6F0",
        champagneDark: "#EADEC9",
        champagneGold: "#B59E7C",
        champagneHover: "#A18A6A",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      borderRadius: {
        btn: "16px",
        card: "16px",
        input: "14px",
        dialog: "16px",
      },
      transitionDuration: {
        normal: "200ms",
        slow: "300ms",
      },
      boxShadow: {
        subtle: "0 2px 8px rgba(0, 0, 0, 0.05)",
      }
    },
  },
  plugins: [],
};

export default config;
