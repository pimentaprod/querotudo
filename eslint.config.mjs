import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Usamos <img> intencionalmente apontando ao Cloudinary para evitar
    // consumo de Image Optimizations da Vercel (decisão arquitetural — ver CLAUDE.md)
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
