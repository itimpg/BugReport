"use client";

import { useCallback, useState } from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

type Toast = Omit<ToastProps, "id"> & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

let count = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ ...props }: Omit<Toast, "id">) => {
    const id = String(++count);
    setToasts((prev) => [...prev.slice(-(TOAST_LIMIT - 1)), { ...props, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), TOAST_REMOVE_DELAY);
    return id;
  }, []);

  return { toasts, toast };
}
