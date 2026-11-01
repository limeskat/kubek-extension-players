import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

console.log('Building frontend bundle for Kubek Players Extension...');

const outdir = path.resolve('frontend/dist');
if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir, { recursive: true });
}

// Inlines imported CSS directly into document.head at runtime
const cssPlugin = {
  name: 'css-inline',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const css = await fs.promises.readFile(args.path, 'utf8');
      return {
        contents: `
if (typeof document !== 'undefined') {
  const styleId = 'kubek-ext-players-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.setAttribute('data-extension', 'com.kubek.players');
    style.textContent = ${JSON.stringify(css)};
    document.head.appendChild(style);
  }
}
export default {};
`,
        loader: 'js',
      };
    });
  },
};

// Shims all react and sdk dependencies to window.Kubek
const reactShimPlugin = {
  name: 'react-shim',
  setup(build) {
    build.onResolve(
      { filter: /^react(\/.*)?$|^react-dom(\/.*)?$/ },
      (args) => ({
        path: args.path,
        namespace: 'react-shim',
      }),
    );

    build.onLoad({ filter: /.*/, namespace: 'react-shim' }, () => ({
      contents: `
const React = (typeof window !== 'undefined' && window.Kubek?.React) || (typeof window !== 'undefined' && window.React) || {};

export default React;
export const {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useContext,
  createContext,
  createElement,
  Fragment,
  forwardRef,
  memo,
  useId,
  useLayoutEffect,
  useTransition,
  useDeferredValue,
  Children,
  cloneElement,
  isValidElement
} = React;

export const jsx = (type, props, key) => React.createElement(type, { ...props, key });
export const jsxs = jsx;
export const jsxDEV = (type, props, key) => React.createElement(type, { ...props, key });
`,
      loader: 'js',
    }));

    build.onResolve({ filter: /^@kubekpanel\/extension-sdk$/ }, (args) => ({
      path: args.path,
      namespace: 'sdk-shim',
    }));

    build.onLoad({ filter: /.*/, namespace: 'sdk-shim' }, () => ({
      contents: `
export default {};
`,
      loader: 'js',
    }));
  },
};

// 1. Build to frontend/dist/index.js
await esbuild.build({
  entryPoints: ['frontend/src/index.ts'],
  bundle: true,
  outfile: 'frontend/dist/index.js',
  format: 'esm',
  target: 'es2022',
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  plugins: [reactShimPlugin, cssPlugin],
  minify: false,
  sourcemap: false,
});

// 2. Build to frontend/index.ts
await esbuild.build({
  entryPoints: ['frontend/src/index.ts'],
  bundle: true,
  outfile: 'frontend/index.ts',
  format: 'esm',
  target: 'es2022',
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  plugins: [reactShimPlugin, cssPlugin],
  minify: false,
  sourcemap: false,
});

console.log('Frontend bundles successfully compiled to frontend/dist/index.js and frontend/index.ts');

// 3. Bundle the backend into a single ESM file. The panel caches extension modules by
// import URL, so a single-file entry lets a re-enable load the complete new backend
// without restarting the panel (relative imports would keep using cached modules).
await esbuild.build({
  entryPoints: ['backend/index.ts'],
  bundle: true,
  outfile: 'backend/entry.js',
  format: 'esm',
  platform: 'node',
  target: 'es2022',
  external: ['@kubekpanel/extension-sdk'],
  minify: false,
  sourcemap: false,
});

console.log('Backend bundle successfully compiled to backend/entry.js');
