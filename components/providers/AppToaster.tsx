"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      theme="light"
      position="top-center"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "rounded-notion border border-border bg-surface-raised text-foreground shadow-md",
          title: "font-medium",
          description: "text-text-secondary",
          closeButton: "text-text-tertiary",
        },
      }}
    />
  );
}
