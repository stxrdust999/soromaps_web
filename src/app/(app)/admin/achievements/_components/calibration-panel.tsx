"use client";

import { AchievementBadge } from "@/components/ui/achievement-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AchievementMock } from "@/types/achievements";

import { triggerOf } from "./use-achievements";

interface CalibrationListProps {
  title: string;
  description: string;
  achievements: AchievementMock[];
  maxObtencoes: number;
  /** Destaca em laranja as zeradas — só faz sentido na lista das menos obtidas. */
  flagEmpty?: boolean;
}

function CalibrationList({
  title,
  description,
  achievements,
  maxObtencoes,
  flagEmpty,
}: CalibrationListProps) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>

      <CardContent className="p-2.5">
        <ul>
          {achievements.map((achievement, index) => {
            const empty = achievement.obtencoes === 0;

            return (
              <li
                key={achievement.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2 py-2.5",
                  index % 2 === 1 && "bg-muted/40",
                )}
              >
                <AchievementBadge
                  layout="icon"
                  badgeSize="sm"
                  achievement={{
                    id: achievement.id,
                    name: achievement.nome,
                    trigger: triggerOf(achievement),
                    icon: achievement.icone,
                    color: achievement.cor,
                    achievedAt: empty ? null : "hoje",
                  }}
                />

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium">
                      {achievement.nome}
                    </span>

                    <span
                      className={cn(
                        "shrink-0 text-xs tabular-nums",
                        empty && flagEmpty
                          ? "text-warning font-semibold"
                          : "text-muted-foreground",
                      )}
                    >
                      {empty
                        ? "ninguém tirou"
                        : `${achievement.obtencoes.toLocaleString("pt-BR")} · ${achievement.raridade}% dos usuários`}
                    </span>
                  </div>

                  <div className="bg-muted h-1 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${empty ? 0 : Math.max((achievement.obtencoes / maxObtencoes) * 100, 3)}%`,
                        backgroundColor: achievement.cor,
                      }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

interface CalibrationPanelProps {
  mostEarned: AchievementMock[];
  leastEarned: AchievementMock[];
  emptyCount: number;
}

/**
 * As duas pontas da distribuição, lado a lado.
 *
 * É a leitura que responde "a economia está equilibrada?" sem varrer a tabela
 * inteira: fácil demais deixa de valer como recompensa, difícil demais ninguém
 * tenta.
 */
export function CalibrationPanel({
  mostEarned,
  leastEarned,
  emptyCount,
}: CalibrationPanelProps) {
  const maxObtencoes = Math.max(...mostEarned.map((item) => item.obtencoes), 1);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <CalibrationList
          title="As 5 mais obtidas"
          description="Fáceis demais deixam de valer como recompensa."
          achievements={mostEarned}
          maxObtencoes={maxObtencoes}
        />

        <CalibrationList
          title="As 5 menos obtidas"
          description="Raras demais e ninguém tenta. Zero é hora de recalibrar."
          achievements={leastEarned}
          maxObtencoes={maxObtencoes}
          flagEmpty
        />
      </div>

      {emptyCount > 0 && (
        <p className="text-muted-foreground text-xs">
          {emptyCount === 1
            ? "A zerada pede quantidade menor ou alvo mais comum"
            : `As ${emptyCount} zeradas pedem quantidade menor ou alvo mais comum`}{" "}
          — não conquista nova.
        </p>
      )}
    </div>
  );
}
