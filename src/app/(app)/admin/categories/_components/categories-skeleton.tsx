import { TableSkeletonState } from "@/components/table/table-skeleton-state";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton da página de administração de categorias.
 */
export function CategoriesSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      {/* header - skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-80" />
          <div className="flex gap-2 mt-1">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-36 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      {/* map strip - skeleton */}
      <Skeleton className="h-32 w-full rounded-xl" />

      {/* table - skeleton */}
      <TableSkeletonState columns={6} />
    </div>
  );
}
