"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DataQualityPointItem } from "@/types/dashboard";

const chartConfig = {
  completos: { label: "Completos", color: "var(--chart-2)" },
  incompletos: { label: "Incompletos", color: "var(--chart-1)" },
} satisfies ChartConfig;

const RANGES = [
  { value: "90", label: "Últimos 3 meses" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "7", label: "Últimos 7 dias" },
];

const dayFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

interface DataQualityChartProps {
  series: DataQualityPointItem[];
}

/**
 * Quantos pontos têm foto, categoria e descrição preenchidos — a métrica que
 * diz se o catálogo está crescendo com qualidade ou só crescendo.
 */
export function DataQualityChart({ series }: DataQualityChartProps) {
  const [range, setRange] = useState("90");

  const data = useMemo(
    () => series.slice(-Number(range)),
    [series, range],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completude do cadastro de pontos</CardTitle>
        <CardDescription>
          Pontos com foto, categoria e descrição preenchidos, contra os que têm
          pelo menos um campo vazio
        </CardDescription>

        <CardAction>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-44" aria-label="Período">
              <SelectValue />
            </SelectTrigger>

            <SelectContent align="end">
              {RANGES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="border-t pt-6">
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <AreaChart data={data} margin={{ left: 8, right: 8 }}>
            <defs>
              {Object.keys(chartConfig).map((key) => (
                <linearGradient
                  key={key}
                  id={`quality-fill-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.7}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="data"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={(value: string) =>
                dayFormatter.format(new Date(`${value}T00:00:00Z`))
              }
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(_, payload) =>
                    dayFormatter.format(
                      new Date(`${payload?.[0]?.payload?.data}T00:00:00Z`),
                    )
                  }
                />
              }
            />

            <Area
              dataKey="completos"
              type="natural"
              stroke="var(--color-completos)"
              fill="url(#quality-fill-completos)"
              stackId="qualidade"
            />

            <Area
              dataKey="incompletos"
              type="natural"
              stroke="var(--color-incompletos)"
              fill="url(#quality-fill-incompletos)"
              stackId="qualidade"
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
