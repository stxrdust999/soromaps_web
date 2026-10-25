import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton de carregamento da visão geral do perfil do explorador.
 */
export function ProfileOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 w-full rounded-xl" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-7 w-40" />
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-7 w-40" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-48 w-44 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
