import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211b",
        moss: "#2f5d50",
        sage: "#e5eee8",
        line: "#d8e1dc",
        amber: "#d98a24"
      },
      boxShadow: {
        soft: "0 1px 2px rgba(23,33,27,0.07), 0 10px 24px rgba(23,33,27,0.06)"
      }
    }
  },
  plugins: []
};

export default config;
