import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton da página de detalhes de um local.
 */
export function PlaceDetailSkeleton() {
  return (
    <div>
      {/* cover - skeleton */}
      <Skeleton className="h-56 w-full sm:h-72 lg:h-80 rounded-none" />

      {/* content - skeleton */}
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-44" />
            <div className="flex items-center gap-2 mt-1">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-1 flex-col gap-6">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>

          <aside className="flex w-full lg:w-80 shrink-0 flex-col gap-4">
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </aside>
        </div>
      </div>
    </div>
  );
}
