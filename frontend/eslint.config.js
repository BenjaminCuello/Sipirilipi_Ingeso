// ESLint Flat Config + Prettier para Vite + React + TS
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  { ignores: ["dist"] },

  // Reglas base JS + TypeScript
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Reglas del proyecto
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "react/react-in-jsx-scope": "off",
    },
  },

  // Desactiva reglas que chocan con Prettier (¡siempre al final!)
  eslintConfigPrettier,
];
