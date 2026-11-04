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
        blue: {
          50: "#edf4ff",
          100: "#d6e7ff",
          200: "#b5d3ff",
          300: "#84b8ff",
          400: "#4c92fb",
          500: "#2172f3",
          600: "#004aad", // Exact Dimsummentai Mamifay Logo Blue!
          700: "#003b8e",
          800: "#003075",
          900: "#00265c",
          950: "#001538",
        },
        brand: {
          DEFAULT: "#004aad",
          hover: "#003b8e",
          dark: "#00265c",
          light: "#edf4ff",
        },
      },
    },
  },
  plugins: [],
};

export default config;
