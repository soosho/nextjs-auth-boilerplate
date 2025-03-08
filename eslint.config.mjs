import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals"],
    rules: {
      "@next/next/no-before-interactive-script-outside-document": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  }),
];

export default eslintConfig;
