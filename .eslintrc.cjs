module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": "warn",
  },
};
