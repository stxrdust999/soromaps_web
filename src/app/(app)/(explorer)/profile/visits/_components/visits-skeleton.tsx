import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton de carregamento da timeline de visitas do perfil.
 */
export function VisitsSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-5 w-72" />
      {Array.from({ length: 2 }, (_, groupIndex) => (
        <div key={groupIndex} className="flex flex-col gap-3">
          <Skeleton className="h-6 w-44" />
          {Array.from({ length: 4 }, (__, rowIndex) => (
            <Skeleton key={rowIndex} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ))}
    </div>
  );
}
