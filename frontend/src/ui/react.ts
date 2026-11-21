import type * as ReactTypes from "react";

type ReactModule = typeof ReactTypes;

/** The panel installs window.Kubek before importing any extension bundle. */
function hostReact(): ReactModule {
  const runtime = (globalThis as { Kubek?: { React?: ReactModule } }).Kubek;
  if (!runtime?.React) {
    throw new Error("Kubek runtime is missing: window.Kubek.React is not available");
  }
  return runtime.React;
}

/**
 * React is owned by the panel. The proxy reads window.Kubek.React on every access, so the
 * bundle never imports or ships its own copy, and a test host installed after import works too.
 */
const React = new Proxy({} as ReactModule, {
  get(_target, property) {
    const host = hostReact();
    const value = (host as unknown as Record<PropertyKey, unknown>)[property];
    return typeof value === "function" ? value.bind(host) : value;
  },
});

export default React;
