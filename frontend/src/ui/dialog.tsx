import React from "react";
import { cx } from "./cx";

type DialogCommon = {
  onClose: () => void;
  label: string;
  width?: number;
  children?: React.ReactNode;
  className?: string;
};

/**
 * The dialog surface without the portal, so it can be rendered in tests and
 * reused by nested dialogs.
 */
export const DialogSurface: React.FC<DialogCommon> = ({
  onClose,
  label,
  width = 480,
  children,
  className,
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const restoreRef = React.useRef<Element | null>(null);

  React.useEffect(() => {
    restoreRef.current = document.activeElement;
    ref.current?.focus();
    return () => {
      const previous = restoreRef.current as HTMLElement | null;
      previous?.focus?.();
    };
  }, []);

  return (
    <div
      className="k-dialog-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cx("k-dialog", className)}
        style={{ ["--k-dialog-width" as string]: `${width}px` }}
      >
        {children}
      </div>
    </div>
  );
};

export const Dialog: React.FC<DialogCommon & { open: boolean }> = ({
  open,
  onClose,
  label,
  width,
  children,
  className,
}) => {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <DialogSurface onClose={onClose} label={label} width={width} className={className}>
      {children}
    </DialogSurface>
  );
};

export const DialogHeader: React.FC<{
  title: React.ReactNode;
  description?: React.ReactNode;
  leading?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, description, leading, actions }) => (
  <header className="k-dialog-header">
    {leading}
    <div className="k-dialog-heading">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
    {actions ? <div className="k-dialog-actions">{actions}</div> : null}
  </header>
);

export const DialogBody: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className,
  children,
}) => <div className={cx("k-dialog-body", className)}>{children}</div>;

export const DialogFooter: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className,
  children,
}) => <footer className={cx("k-dialog-footer", className)}>{children}</footer>;
