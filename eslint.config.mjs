import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  {
    ignores: [
      ".local/**",
      ".next/**",
      "out/**",
      "output/**",
      ".playwright-cli/**",
      "coverage/**",
      ".eslintcache",
      "node_modules/**",
      "public/uploads/**",
      "raporlar/**",
      "*.tsbuildinfo",
    ],
  },
  {
    extends: [...nextCoreWebVitals],
  },
]);
