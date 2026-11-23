import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";

const SRC = import.meta.dir;

function tsxFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return tsxFiles(full);
    return entry.name.endsWith(".tsx") ? [full] : [];
  });
}

describe("panel JSX build", () => {
  // The panel builds from its own cwd, where tsconfig.json sets react-jsx. Without the
  // classic pragmas Bun emits an import from react/jsx-dev-runtime, which the browser
  // cannot resolve. Keep every JSX file self-contained.
  test("every .tsx opts into the classic JSX runtime", () => {
    const missing = tsxFiles(SRC).filter((file) => {
      const head = fs.readFileSync(file, "utf8").slice(0, 120);
      return !head.includes("@jsxRuntime classic") || !head.includes("@jsx React.createElement");
    });
    expect(missing).toEqual([]);
  });
});
