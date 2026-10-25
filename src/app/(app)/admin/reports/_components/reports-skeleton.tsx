import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton de carregamento da caixa de entrada de denúncias e feedback (`/admin/reports`).
 */
export function ReportsSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* header - skeleton */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b px-8 py-7">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
          <div className="mt-3 flex flex-wrap gap-2">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-5 w-36 rounded-full" />
            <Skeleton className="h-5 w-40 rounded-full" />
          </div>
        </div>

        <Skeleton className="h-9 w-44 rounded-lg" />
      </div>

      {/* master-detail - skeleton */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[320px_1fr]">
        {/* queue - skeleton */}
        <div className="flex flex-col gap-3 border-r p-3.5">
          <Skeleton className="h-8 w-full rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="h-8 flex-1 rounded-md" />
          </div>
          <div className="space-y-2 pt-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`report-queue-skeleton-${index}`}
                className="flex flex-col gap-2 rounded-lg border p-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3.5 w-3/4" />
              </div>
            ))}
          </div>
        </div>

        {/* detail - skeleton */}
        <div className="flex flex-col gap-6 p-8">
          <div className="space-y-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-7 w-72" />
          </div>
          <Skeleton className="h-36 w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Skeleton className="h-44 rounded-lg" />
            <Skeleton className="h-44 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
