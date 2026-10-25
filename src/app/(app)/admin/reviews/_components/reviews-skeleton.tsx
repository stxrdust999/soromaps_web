import { TableSkeletonState } from "@/components/table/table-skeleton-state";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton da página de administração de avaliações.
 */
export function ReviewsSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      {/* header and stats - skeleton */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-96" />

        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>

      {/* table - skeleton */}
      <TableSkeletonState columns={7} />
    </div>
  );
}
