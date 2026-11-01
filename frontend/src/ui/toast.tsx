import React from "react";
import { cx } from "./cx";

export type ToastType = "success" | "error" | "info";

export type ToastInput = {
  type: ToastType;
  title: string;
  description?: string;
};

type Toast = ToastInput & { id: string };

const ToastContext = React.createContext<{ notify: (toast: ToastInput) => void }>({
  notify: () => {},
});

export function useToast() {
  return React.useContext(ToastContext);
}

export const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => (
  <div
    className={cx("k-toast", `k-toast-${toast.type}`)}
    data-variant={toast.type}
    role={toast.type === "error" ? "alert" : "status"}
  >
    <div className="k-toast-text">
      <div className="k-toast-title">{toast.title}</div>
      {toast.description ? <div className="k-toast-description">{toast.description}</div> : null}
    </div>
  </div>
);

export const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const notify = React.useCallback((toast: ToastInput) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [...current.slice(-2), { ...toast, id }]);
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 4000);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="k-toasts" role="region" aria-label="Notifications">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
