"use client";

import React, { useCallback, useState } from "react";
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Global toast context
const toasts = new Map<string, Toast>();
const listeners = new Set<(toasts: Map<string, Toast>) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener(toasts));
}

/**
 * Hook to use toast notifications
 */
export function useToast() {
  const [, setToasts] = useState<Map<string, Toast>>(toasts);

  React.useEffect(() => {
    const listener = (updatedToasts: Map<string, Toast>) => {
      setToasts(new Map(updatedToasts));
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const toast = useCallback((config: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = config.duration ?? 5000;
    const newToast: Toast = { id, ...config, duration };
    toasts.set(id, newToast);
    notifyListeners();

    if (duration > 0) {
      setTimeout(() => {
        toasts.delete(id);
        notifyListeners();
      }, duration);
    }

    return id;
  }, []);

  const success = useCallback(
    (message: string, description?: string) =>
      toast({ type: "success", message, description }),
    [toast]
  );

  const error = useCallback(
    (message: string, description?: string) =>
      toast({ type: "error", message, description }),
    [toast]
  );

  const warning = useCallback(
    (message: string, description?: string) =>
      toast({ type: "warning", message, description }),
    [toast]
  );

  const info = useCallback(
    (message: string, description?: string) =>
      toast({ type: "info", message, description }),
    [toast]
  );

  const dismiss = useCallback((id: string) => {
    toasts.delete(id);
    notifyListeners();
  }, []);

  return { toast, success, error, warning, info, dismiss };
}

/**
 * Toast container component - must be placed at app root
 */
export function ToastContainer() {
  const [activeToasts, setActiveToasts] = useState<Map<string, Toast>>(toasts);

  React.useEffect(() => {
    const listener = (updatedToasts: Map<string, Toast>) => {
      setActiveToasts(new Map(updatedToasts));
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {Array.from(activeToasts.values()).map((item) => (
          <ToastItem key={item.id} toast={item} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Individual toast item
 */
function ToastItem({ toast }: { toast: Toast }) {
  const { dismiss } = useToast();

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, x: 100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 20, x: 100 }}
      className={`mb-3 rounded-lg border p-4 flex gap-4 items-start max-w-sm pointer-events-auto ${bgColors[toast.type]}`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm">{toast.message}</p>
        {toast.description && (
          <p className="text-xs text-muted-text mt-1">{toast.description}</p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-xs font-medium text-primary hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss notification"
        className="flex-shrink-0 rounded-md p-1 text-muted-text hover:bg-background hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
