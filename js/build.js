// build.js
import { build } from "esbuild";

build({
  entryPoints: ["index.js"],
  bundle: true,
  format: "cjs",
  outfile: "dist/index.cjs",
  platform: "node"
}).catch(() => process.exit(1));