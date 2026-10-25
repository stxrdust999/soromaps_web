"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { PlaceSegmentItem } from "@/types/dashboard";

import { InfoHint } from "./info-hint";

interface PlaceSegmentationCardProps {
  segments: PlaceSegmentItem[];
}

/** Rosca de pontos por categoria, com a legenda como lista de valores ao lado. */
export function PlaceSegmentationCard({
  segments,
}: PlaceSegmentationCardProps) {
  const chartConfig = useMemo<ChartConfig>(
    () =>
      Object.fromEntries(
        segments.map((segment, index) => [
          segment.key,
          {
            label: segment.categoria,
            color: segment.color ?? `var(--chart-${(index % 5) + 1})`,
          },
        ]),
      ),
    [segments],
  );

  return (
    <Card className="justify-between gap-4">
      <CardHeader>
        <CardTitle>Segmentação de pontos</CardTitle>

        <CardAction>
          <InfoHint>
            Distribuição de locais aprovados agrupados pelas categorias ativas
            do catálogo.
          </InfoHint>
        </CardAction>
      </CardHeader>

      <CardContent className="flex items-center gap-4 sm:gap-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-square h-24 shrink-0 sm:h-28"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="key" hideLabel />}
            />

            <Pie
              data={segments}
              dataKey="total"
              nameKey="key"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {segments.map((segment, index) => (
                <Cell
                  key={segment.key}
                  fill={segment.color ?? `var(--chart-${(index % 5) + 1})`}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
          {segments.map((segment, index) => (
            <li
              key={segment.key}
              className="flex items-center gap-2 text-sm leading-none"
            >
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    segment.color ?? `var(--chart-${(index % 5) + 1})`,
                }}
              />
              <span className="truncate text-muted-foreground">
                {segment.categoria}
              </span>
              <span className="ml-auto shrink-0 font-medium tabular-nums">
                {segment.total.toLocaleString("pt-BR")}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <CardDescription className="text-xs">
          Distribuição da quantidade de pontos cadastrados por categoria
        </CardDescription>
      </CardFooter>
    </Card>
  );
}

