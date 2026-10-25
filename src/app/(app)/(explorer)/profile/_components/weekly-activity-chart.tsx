"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ProfileWeekActivity } from "@/types/profile";

const chartConfig = {
  visitas: { label: "Visitas", color: "var(--chart-2)" },
  avaliacoes: { label: "Avaliações", color: "var(--chart-4)" },
} satisfies ChartConfig;

interface WeeklyActivityChartProps {
  data: ProfileWeekActivity[];
}

/** Visitas e avaliações nas últimas oito semanas. */
export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart data={data} margin={{ left: 8, right: 8 }}>
        <CartesianGrid vertical={false} />

        <XAxis
          dataKey="semana"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />

        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />

        <Bar dataKey="visitas" fill="var(--color-visitas)" radius={4} />
        <Bar dataKey="avaliacoes" fill="var(--color-avaliacoes)" radius={4} />

        <ChartLegend content={<ChartLegendContent />} />
      </BarChart>
    </ChartContainer>
  );
}
