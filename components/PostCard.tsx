"use client";

import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";

export function PostCard({
  id,
  type,
  title,
  description,
  category,
  budgetMin,
  budgetMax,
  location,
  createdAt,
}: {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  location?: string | null;
  createdAt: Date;
}) {
  const isRequest = type === "REQUEST";
  const timeAgo = new Date().getTime() - new Date(createdAt).getTime();
  const hours = Math.floor(timeAgo / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  const timeStr =
    days > 0 ? `${days} j` : hours > 0 ? `${hours} h` : "À l’instant";

  const hasBudget =
    budgetMin != null &&
    budgetMax != null &&
    budgetMin > 0 &&
    budgetMax > 0;

  return (
    <Link
      href={`/post/${id}`}
      className="group flex overflow-hidden rounded-notion border border-border bg-surface-raised shadow-sm transition-[border-color,background-color,box-shadow] duration-150 ease-smooth hover:bg-overlay-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span
        className={`w-[3px] shrink-0 self-stretch ${
          isRequest ? "bg-warning/85" : "bg-success/85"
        }`}
        aria-hidden
      />

      <div className="min-w-0 flex-1 px-3.5 py-3 sm:px-4 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary/95">
            {isRequest ? "Demande" : "Offre"}
          </span>
          <time
            className="shrink-0 text-[11px] font-medium tabular-nums text-text-tertiary"
            dateTime={new Date(createdAt).toISOString()}
          >
            {timeStr}
          </time>
        </div>

        <div className="mt-1.5 flex items-start justify-between gap-2">
          <h3 className="min-w-0 flex-1 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-foreground transition-colors group-hover:text-accent-ink">
            {title}
          </h3>
          <ChevronRight
            className="mt-0.5 size-4 shrink-0 text-text-tertiary opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            strokeWidth={1.65}
            aria-hidden
          />
        </div>

        <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.45] text-text-secondary">
          {description}
        </p>

        <p className="mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-text-tertiary">
          <span className="font-medium text-text-secondary">{category}</span>
          {location ? (
            <>
              <span className="text-border" aria-hidden>
                ·
              </span>
              <span className="inline-flex max-w-[12rem] items-center gap-0.5 truncate sm:max-w-[16rem]">
                <MapPin
                  className="size-3 shrink-0 opacity-70"
                  strokeWidth={1.65}
                  aria-hidden
                />
                <span className="truncate">{location}</span>
              </span>
            </>
          ) : null}
          {hasBudget ? (
            <>
              <span className="text-border" aria-hidden>
                ·
              </span>
              <span className="tabular-nums font-medium text-text-secondary">
                {budgetMin!.toLocaleString("fr-FR")}–
                {budgetMax!.toLocaleString("fr-FR")} €
              </span>
            </>
          ) : null}
        </p>
      </div>
    </Link>
  );
}
