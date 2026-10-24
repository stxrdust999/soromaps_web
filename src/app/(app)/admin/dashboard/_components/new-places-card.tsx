import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { NewPlacesSummary } from "@/types/dashboard";

import { InfoHint } from "./info-hint";

interface NewPlacesCardProps {
  summary: NewPlacesSummary;
}

/**
 * Lugares cadastrados na semana, quebrados por estágio de moderação — o
 * mesmo número que a fila "Moderação de pontos" despacha, visto por outro
 * ângulo.
 */
export function NewPlacesCard({ summary }: NewPlacesCardProps) {
  const { total, metaAtingida, variacaoSemanal, stages } = summary;
  const totalStages = Math.max(
    stages.reduce((sum, stage) => sum + stage.total, 0),
    1,
  );

  return (
    <Card className="justify-between gap-4">
      <CardHeader>
        <CardTitle>Lugares novos na última semana</CardTitle>

        <CardAction>
          <InfoHint>
            Pontos criados nos últimos 7 dias. A meta semanal é fixa em 200 até
            existir base histórica para calibrá-la.
          </InfoHint>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-4xl font-medium tabular-nums">{total}</span>
          <span className="text-xs text-muted-foreground">
            {metaAtingida}% da meta semanal
          </span>
        </div>

        <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
          {stages.map((stage, index) => (
            <div
              key={stage.key}
              className="h-full"
              style={{
                width: `${(stage.total / totalStages) * 100}%`,
                backgroundColor: `var(--chart-${index + 1})`,
              }}
            />
          ))}
        </div>

        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {stages.map((stage, index) => (
            <li
              key={stage.key}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: `var(--chart-${index + 1})` }}
              />
              {stage.label}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <CardDescription className="text-xs">
          {variacaoSemanal}% em relação à semana anterior
        </CardDescription>
      </CardFooter>
    </Card>
  );
}

