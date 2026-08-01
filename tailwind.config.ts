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
        background: "#FFFFFF",
        secondaryBg: "#F8F8F8",
        surface: "#FFFFFF",
        elevatedSurface: "#F8F8F8",
        primaryText: "#1A1A1A",
        secondaryText: "#6B7280",
        mutedText: "#9CA3AF",
        border: "#E5E7EB",
        primaryAccent: "#111111",
        primaryHover: "#333333",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
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
