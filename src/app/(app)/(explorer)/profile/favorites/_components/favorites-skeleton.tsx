import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton de carregamento da grade de lugares salvos pelo explorador.
 */
export function FavoritesSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-72 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
