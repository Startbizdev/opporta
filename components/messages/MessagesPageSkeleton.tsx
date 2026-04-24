import { Skeleton } from "@/components/ui/Skeleton";

export function MessagesPageSkeleton() {
  return (
    <div
      className="grid min-h-[calc(100vh-8rem)] grid-cols-1 gap-6 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Chargement des conversations"
    >
      <div className="space-y-2 lg:col-span-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-surface-raised p-4 shadow-sm"
          >
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="flex min-h-[420px] flex-col rounded-lg border border-border bg-surface-raised p-6 shadow-sm lg:col-span-2">
        <Skeleton className="mb-6 h-5 w-2/3" />
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton className="mr-auto h-16 w-[72%] rounded-lg" />
          <Skeleton className="ml-auto h-14 w-[68%] rounded-lg" />
          <Skeleton className="mr-auto h-20 w-[80%] rounded-lg" />
        </div>
        <div className="mt-6 flex gap-2 border-t border-border pt-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}
