import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton de carregamento da tela de cadastro de novo local no mapa.
 */
export function NewPlaceSkeleton() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-muted/40">
      <div className="absolute bottom-4 left-1/2 z-10 w-full max-w-md -translate-x-1/2 px-4 md:bottom-8">
        <div className="flex flex-col gap-4 rounded-xl border bg-background/95 p-5 shadow-2xl">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="flex gap-3">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <Skeleton className="h-9 flex-1 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
