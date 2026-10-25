import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton de carregamento da gestão de conquistas (`/admin/achievements`).
 */
export function AchievementsAdminSkeleton() {
  return (
    <main className="flex flex-1 flex-col">
      {/* header - skeleton */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-72" />
            <div className="mt-3 flex flex-wrap gap-2">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-44 rounded-full" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-44 rounded-lg" />
            <Skeleton className="h-9 w-36 rounded-md" />
          </div>
        </div>

        {/* badge-strip - skeleton */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3.5 w-64" />
          </div>
          <div className="bg-muted/30 flex flex-wrap gap-x-5 gap-y-4 rounded-xl border p-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`achievement-badge-skeleton-${index}`}
                className="flex w-24 flex-col items-center gap-2"
              >
                <Skeleton className="size-14 rounded-full" />
                <Skeleton className="h-3.5 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* table - skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-28 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>

          <div className="overflow-hidden rounded-xl border">
            <div className="border-b px-4 py-3">
              <Skeleton className="h-4 w-full" />
            </div>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`achievement-row-skeleton-${index}`}
                className="flex items-center justify-between gap-4 border-b px-4 py-3.5 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
