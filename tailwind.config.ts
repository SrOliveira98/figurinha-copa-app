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
        foreground: "var(--foreground)",
        brand: {
          green: "#009C3B",
          yellow: "#FFDF00",
          blue: "#002776",
          cyan: "#00C4C8",
          dark: "#002050",
        },
        site: "#F9F9F9",
      },
      boxShadow: {
        card: "0 20px 70px rgba(0, 39, 118, 0.10)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-anton)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
