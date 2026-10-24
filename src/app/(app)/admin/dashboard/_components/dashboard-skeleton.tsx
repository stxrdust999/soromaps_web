import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton de carregamento do dashboard administrativo (`/admin/dashboard`).
 */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      {/* queues - skeleton */}
      <section className="flex flex-col gap-4">
        <Skeleton className="h-8 w-52" />
        <div className="overflow-hidden rounded-xl border">
          <div className="border-b px-4 py-3">
            <Skeleton className="h-4 w-full" />
          </div>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`dashboard-queue-skeleton-${index}`}
              className="flex items-center justify-between gap-4 border-b px-4 py-3.5 last:border-b-0"
            >
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="size-4 rounded-sm" />
            </div>
          ))}
        </div>
      </section>

      {/* metrics - skeleton */}
      <section className="flex flex-col gap-4">
        <Skeleton className="h-8 w-36" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-26 rounded-xl" />
            <Skeleton className="h-26 rounded-xl" />
          </div>
        </div>
      </section>

      {/* signups-chart - skeleton */}
      <section className="flex flex-col gap-4">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-96 rounded-xl" />
      </section>

      {/* data-quality-chart - skeleton */}
      <section className="flex flex-col gap-4">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-96 rounded-xl" />
      </section>
    </div>
  );
}
