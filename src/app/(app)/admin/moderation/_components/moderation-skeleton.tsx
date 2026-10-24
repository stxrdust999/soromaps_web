import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton da página de moderação de pontos.
 */
export function ModerationSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* header and stats - skeleton */}
      <div className="flex flex-col gap-4 px-8 py-7 border-b">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-40" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>

      {/* panels - skeleton */}
      <div className="flex flex-1 min-h-0">
        <div className="w-80 border-r p-4 flex flex-col gap-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>

        <div className="flex-1 p-8 flex flex-col gap-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-5 lg:grid-cols-2">
            <Skeleton className="h-56 rounded-lg" />
            <Skeleton className="h-56 rounded-lg" />
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
