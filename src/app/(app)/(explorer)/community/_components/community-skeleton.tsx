import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton da página de Comunidade.
 */
export function CommunitySkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6">
      {/* header - skeleton */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
      </div>

      {/* showcase - skeleton */}
      <div className="grid gap-4 lg:grid-cols-2 lg:grid-rows-2">
        <Skeleton className="h-96 rounded-2xl lg:row-span-2" />
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>

      {/* explorers and sidebar - skeleton */}
      <div className="flex gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-9 w-72" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
        </div>

        <aside className="hidden w-80 shrink-0 flex-col gap-4 xl:flex">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
        </aside>
      </div>
    </div>
  );
}
