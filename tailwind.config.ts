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
        background: "#2E2E2E",
        secondaryBg: "#1C1C1C",
        surface: "#242424",
        elevatedSurface: "#333333",
        primaryText: "#F5F5F5",
        secondaryText: "#B5B7BE",
        mutedText: "#7A7D85",
        border: "rgba(255, 255, 255, 0.08)",
        primaryAccent: "#C9A66B",
        primaryHover: "#D8B67E",
        success: "#3BB273",
        warning: "#F0B429",
        error: "#D64545",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      borderRadius: {
        btn: "9999px",
        card: "4px",
        input: "4px",
        dialog: "4px",
      },
      transitionDuration: {
        normal: "250ms",
        slow: "350ms",
      },
    },
  },
  plugins: [],
};

export default config;
