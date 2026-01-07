import tsParser from "@typescript-eslint/parser"
import reactPlugin from "eslint-plugin-react"
import prettierPlugin from "eslint-plugin-prettier"

export default [
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 2022, sourceType: "module", ecmaFeatures: { jsx: true } },
    },
    plugins: { react: reactPlugin, prettier: prettierPlugin },
    rules: {
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "prettier/prettier": "warn",
    },
  },
]
