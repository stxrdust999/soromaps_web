import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton de carregamento das trilhas do painel lateral da página inicial do mapa.
 */
export function HomeFeedSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-8 pb-4">
      {Array.from({ length: 2 }, (_, sectionIndex) => (
        <div key={sectionIndex} className="flex flex-col gap-3">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 3 }, (__, cardIndex) => (
              <Skeleton
                key={cardIndex}
                className="h-64 w-60 flex-none rounded-2xl"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
