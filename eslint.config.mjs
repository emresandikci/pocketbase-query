import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { ignores: ["dist/", "**/*.test.*", "*.cjs"] },
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  //dont check "any" types
  { rules: { "@typescript-eslint/no-explicit-any": "off" } },
];
