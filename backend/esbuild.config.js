import { build } from "esbuild";
import glob from "fast-glob";

const entryPoints = await glob("src/**/*.ts");

await build({
  entryPoints,
  outdir: "dist",
  bundle: false,
  platform: "node",
  format: "esm",
  target: ["es2022"],
  sourcemap: true,
  splitting: false,
  outbase: "src",
  outExtension: { ".js": ".js" },
  loader: { ".ts": "ts" },
  mainFields: ["module", "main"],
  conditions: ["import", "module"],
  resolveExtensions: [".ts", ".js", ".json"],
  external: ["node:*"],
});
