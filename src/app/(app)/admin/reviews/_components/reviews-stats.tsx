import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

interface StatProps {
  label: string;
  value: string | number;
  trailing?: ReactNode;
}

function Stat({ label, value, trailing }: StatProps) {
  return (
    <div className="rounded-lg border px-4 py-3">
      <p className="text-muted-foreground text-sm">{label}</p>

      <div className="mt-0.5 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {trailing}
      </div>
    </div>
  );
}

interface ReviewsStatsProps {
  publicadas: number;
  notaMedia: number;
  removidas: number;
  comSinal: number;
}

/**
 * Indicadores numéricos da listagem administrativa de avaliações.
 */
export function ReviewsStats({
  publicadas,
  notaMedia,
  removidas,
  comSinal,
}: ReviewsStatsProps) {
  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Avaliações publicadas" value={publicadas} />

      <Stat
        label="Nota média da plataforma"
        value={notaMedia.toLocaleString("pt-BR", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}
        trailing={<Badge variant="outline">Escala 1–5</Badge>}
      />

      <Stat label="Removidas" value={removidas} />

      <Stat
        label="Com sinal de problema"
        value={comSinal}
        trailing={
          comSinal > 0 ? <Badge variant="warning">requer olhar</Badge> : null
        }
      />
    </div>
  );
}
