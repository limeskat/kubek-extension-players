import * as React from "react";

// Tests render components on the Node side, while the shipped bundle reads the host React
// from window.Kubek. Install the same surface before any test module imports a component.
(globalThis as typeof globalThis & { Kubek?: unknown }).Kubek = { React };
