import { type HTMLAttributes } from "react";

const shimmerClass =
  "bg-gradient-to-r from-overlay-skeleton via-overlay-skeleton-strong to-overlay-skeleton bg-[length:200%_100%] animate-shimmer-bg";

export function Skeleton({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-notion ${shimmerClass} ${className}`}
      aria-hidden
      {...props}
    />
  );
}
