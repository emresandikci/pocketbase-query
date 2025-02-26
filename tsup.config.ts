import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true, // declaration files
  splitting: false,
  sourcemap: false,
  clean: true,
  minify:true
});