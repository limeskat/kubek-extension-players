import { expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogSurface } from "./dialog";
import { ToastItem } from "./toast";

test("closed dialog renders nothing", () => {
  const html = renderToStaticMarkup(
    <Dialog open={false} onClose={() => {}} label="Player details">
      <span>body</span>
    </Dialog>,
  );
  expect(html).toBe("");
});

test("dialog surface is a labelled modal with header, body and footer", () => {
  const html = renderToStaticMarkup(
    <DialogSurface onClose={() => {}} label="Player details" width={1040}>
      <DialogHeader title="Notch" description="uuid" />
      <DialogBody>content</DialogBody>
      <DialogFooter>actions</DialogFooter>
    </DialogSurface>,
  );
  expect(html).toContain('role="dialog"');
  expect(html).toContain('aria-modal="true"');
  expect(html).toContain('aria-label="Player details"');
  expect(html).toContain("k-dialog-header");
  expect(html).toContain("k-dialog-body");
  expect(html).toContain("k-dialog-footer");
  expect(html).toContain("Notch");
  expect(html).toContain("--k-dialog-width:1040px");
});

test("toast item reports its variant and role", () => {
  const success = renderToStaticMarkup(
    <ToastItem toast={{ id: "1", type: "success", title: "Saved" }} />,
  );
  expect(success).toContain('data-variant="success"');
  expect(success).toContain('role="status"');
  expect(success).toContain("Saved");

  const error = renderToStaticMarkup(
    <ToastItem toast={{ id: "2", type: "error", title: "Failed", description: "Reason" }} />,
  );
  expect(error).toContain('data-variant="error"');
  expect(error).toContain('role="alert"');
  expect(error).toContain("Reason");
});
