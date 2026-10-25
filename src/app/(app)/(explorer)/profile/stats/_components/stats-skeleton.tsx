import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton de carregamento dos gráficos e métricas da aba de estatísticas do perfil.
 */
export function StatsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-44 w-full rounded-xl" />
      <Skeleton className="h-56 w-full rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}
