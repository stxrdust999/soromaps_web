import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MetricCardMock } from "@/types/dashboard";

import { InfoHint } from "./info-hint";

interface MetricCardProps {
  metric: MetricCardMock;
}

/** Número seco da semana, com a variação sobre a anterior no rodapé. */
export function MetricCard({ metric }: MetricCardProps) {
  return (
    <Card className="flex-1 justify-center gap-3">
      <CardHeader>
        <CardTitle>{metric.label}</CardTitle>

        <CardAction>
          <InfoHint>{metric.hint}</InfoHint>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-4xl font-medium tabular-nums">
          {metric.valor.toLocaleString("pt-BR")}
        </span>

        <CardDescription className="text-xs">
          {metric.variacaoSemanal}% a mais que na semana anterior
        </CardDescription>
      </CardContent>
    </Card>
  );
}
