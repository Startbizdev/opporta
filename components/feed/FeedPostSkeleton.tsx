import { Skeleton } from "@/components/ui/Skeleton";

export function FeedPostSkeleton() {
  return (
    <div
      className="flex overflow-hidden rounded-notion border border-border bg-surface-raised shadow-sm"
      aria-hidden
    >
      <div className="w-[3px] shrink-0 self-stretch bg-border" />
      <div className="min-w-0 flex-1 px-3.5 py-3 sm:px-4 sm:py-3.5">
        <div className="flex justify-between gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
        <div className="mt-2 flex justify-between gap-2">
          <Skeleton className="h-5 max-w-[min(100%,18rem)] flex-1" />
          <Skeleton className="mt-0.5 size-4 shrink-0 rounded-sm" />
        </div>
        <div className="mt-2 space-y-1.5">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}
