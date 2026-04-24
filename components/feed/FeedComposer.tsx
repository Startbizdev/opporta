"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowDownLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CreatePostForm } from "@/components/post/CreatePostForm";

function subscribeMdUp(cb: () => void) {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getMdUpSnapshot() {
  return window.matchMedia("(min-width: 768px)").matches;
}

function getServerMdUpSnapshot() {
  return false;
}

function useIsMdUp() {
  return useSyncExternalStore(subscribeMdUp, getMdUpSnapshot, getServerMdUpSnapshot);
}

export type FeedComposerProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onPosted?: () => void;
};

export function FeedComposer({
  open: openProp,
  onOpenChange,
  onPosted,
}: FeedComposerProps) {
  const [innerOpen, setInnerOpen] = useState(false);
  const isOpen = openProp ?? innerOpen;

  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (openProp === undefined) setInnerOpen(next);
  };

  const [barType, setBarType] = useState<"REQUEST" | "OFFER">("REQUEST");
  const [username, setUsername] = useState("");
  const [formKey, setFormKey] = useState(0);
  const prevOpenRef = useRef(isOpen);

  const isMdUp = useIsMdUp();

  useEffect(() => {
    const name = localStorage.getItem("username") || "";
    const email = localStorage.getItem("user") || "";
    const label = name || email.split("@")[0] || "?";
    queueMicrotask(() => setUsername(label));
  }, []);

  useEffect(() => {
    if (prevOpenRef.current && !isOpen) setFormKey((k) => k + 1);
    prevOpenRef.current = isOpen;
  }, [isOpen]);

  const initials = (username || "?").slice(0, 2).toUpperCase();

  const form = (
    <CreatePostForm
      key={formKey}
      initialType={barType}
      density={isMdUp ? "comfortable" : "compact"}
      onCancel={() => setOpen(false)}
      onPosted={() => {
        setOpen(false);
        onPosted?.();
      }}
    />
  );

  return (
    <>
      <div className="rounded-lg border border-border bg-surface-raised p-3 shadow-sm sm:p-4">
        <div className="flex gap-3 sm:gap-3.5">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-field text-[10px] font-semibold uppercase tracking-[0.04em] text-text-secondary ring-1 ring-border sm:size-10 sm:text-[11px]"
            aria-hidden
          >
            {initials}
          </span>

          <div className="min-w-0 flex-1 space-y-2.5">
            <div
              className={`flex flex-wrap items-center gap-1.5 ${
                isOpen ? "pointer-events-none opacity-45" : ""
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary/90">
                Type
              </span>
              <div className="inline-flex rounded-notion border border-border bg-field p-0.5">
                <button
                  type="button"
                  onClick={() => setBarType("REQUEST")}
                  className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 ${
                    barType === "REQUEST"
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <ArrowDownLeft className="size-3 opacity-80" strokeWidth={1.65} />
                  Demande
                </button>
                <button
                  type="button"
                  onClick={() => setBarType("OFFER")}
                  className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 ${
                    barType === "OFFER"
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <ArrowUpRight className="size-3 opacity-80" strokeWidth={1.65} />
                  Offre
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex w-full items-center justify-between gap-3 rounded-notion border border-border bg-field px-3 py-2.5 text-left transition-colors hover:bg-overlay-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
            >
              <span className="truncate text-[13px] text-text-tertiary">
                Nouvelle opportunité — titre, description, budget…
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-text-tertiary opacity-70"
                strokeWidth={1.65}
                aria-hidden
              />
            </button>
          </div>
        </div>
      </div>

      {isMdUp ? (
        <Dialog open={isOpen} onOpenChange={setOpen}>
          <DialogContent className="flex flex-col gap-0 p-0">
            <DialogHeader className="shrink-0">
              <DialogTitle>Nouvelle opportunité</DialogTitle>
              <DialogDescription>
                Une annonce précise attire des réponses plus qualifiées.
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {form}
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet open={isOpen} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="max-h-[92dvh] gap-0 p-0">
            <SheetHeader className="shrink-0 border-b border-border/80">
              <SheetTitle>Nouvelle opportunité</SheetTitle>
              <SheetDescription>
                Une annonce précise attire des réponses plus qualifiées.
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {form}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
