import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton da página do Feed.
 */
export function FeedSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      {/* header - skeleton */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </div>

      {/* columns - skeleton */}
      <div className="flex gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
        </div>

        <aside className="hidden w-80 shrink-0 flex-col gap-4 xl:flex">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </aside>
      </div>
    </div>
  );
}
