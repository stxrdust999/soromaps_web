import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton da página de pauta editorial.
 */
export function StoryArticleSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      {/* cover - skeleton */}
      <Skeleton className="h-64 w-full sm:h-80 rounded-none" />

      {/* article - skeleton */}
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-6 w-48 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </div>

        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />

        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
