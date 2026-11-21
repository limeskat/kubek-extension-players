/**
 * Build the frontend half into the ESM bundle the panel serves. The panel also builds this on
 * install; the local build is for the UI probe and for checking the bundle before release.
 * React and the SDK are owned by the host and never bundled.
 */
const result = await Bun.build({
  entrypoints: ["frontend/src/index.ts"],
  outdir: "frontend/dist",
  format: "esm",
  target: "browser",
  minify: false,
  external: ["react", "react-dom", "@kubekpanel/extension-sdk"],
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

const output = await Bun.file("frontend/dist/index.js").text();
const bareReact = /(?:^|\n)\s*import[^;\n]*from\s*["']react(?:-dom)?["']/.test(output);
if (bareReact) {
  console.error("frontend/dist/index.js still imports React; the panel would fail to load it");
  process.exit(1);
}

console.log("built frontend/dist/index.js");

export {};
