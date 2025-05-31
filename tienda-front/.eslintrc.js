module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ["plugin:vue/essential", "eslint:recommended"],
  parserOptions: {
    requireConfigFile: false,
  },
  rules: {
    "no-console": "off",
    "no-debugger": "off",
  },
};