import {
  CheckCircle2Icon,
  ClockIcon,
  RotateCcwIcon,
  TimerIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface ModerationStatsProps {
  pendingCount: number;
  returnedCount: number;
  decididosHoje: number;
  tempoMedio: string;
}

interface StatProps {
  label: string;
  icon: React.ReactNode;
  value: string | number;
  trailing?: React.ReactNode;
}

function Stat({ label, icon, value, trailing }: StatProps) {
  return (
    <div className="rounded-lg border px-4 py-3">
      <div className="w-full flex flex-row justify-between">
        <p className="text-muted-foreground text-sm">{label}</p>

        {icon}
      </div>

      <div className="mt-0.5 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {trailing}
      </div>
    </div>
  );
}

/**
 * Indicadores numéricos do topo da fila de moderação.
 */
export function ModerationStats({
  pendingCount,
  returnedCount,
  decididosHoje,
  tempoMedio,
}: ModerationStatsProps) {
  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat
        label="Pendentes"
        icon={
          <div className="bg-muted p-1.5 rounded-sm">
            <ClockIcon className="size-4 text-muted-foreground" />
          </div>
        }
        value={pendingCount}
      />
      <Stat
        label="Devolvidos aguardando o autor"
        icon={
          <div className="bg-muted p-1.5 rounded-sm">
            <RotateCcwIcon className="size-4 text-muted-foreground" />
          </div>
        }
        value={returnedCount}
      />
      <Stat
        label="Decididos hoje"
        icon={
          <div className="bg-muted p-1.5 rounded-sm">
            <CheckCircle2Icon className="size-4 text-muted-foreground" />
          </div>
        }
        value={decididosHoje}
      />
      <Stat
        label="Tempo médio de decisão"
        icon={
          <div className="bg-muted p-1.5 rounded-sm">
            <TimerIcon className="size-4 text-muted-foreground" />
          </div>
        }
        value={tempoMedio}
        trailing={<Badge variant="outline">SLA 48h</Badge>}
      />
    </div>
  );
}
