import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton de carregamento da tela Descobrir enquanto a lista de locais é resolvida via streaming.
 */
export function DiscoverSkeleton() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6">
      {/* header - section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>

      {/* hero carousel - section */}
      <Skeleton className="h-72 w-full rounded-2xl" />

      {/* trending grid - section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-72 w-full rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
