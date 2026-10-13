export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      ["canvas", "generator", "api", "shared", "infra", "docs", "adr", "deps"],
    ],
  },
};
