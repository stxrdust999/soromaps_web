"use client";

import { use, useMemo } from "react";

import { AchievementBadge } from "@/components/ui/achievement-badge";
import { Card, CardContent } from "@/components/ui/card";
import { resolveAchievementIcon } from "@/constants/achievements";
import type { listMyAchievementsResponse } from "@/http/achievements/achievements";
import { formatVisitDate, type ProfileAchievement } from "@/types/profile";

import { AchievementProgressCard } from "../../_components/achievement-progress-card";

interface AchievementsContentProps {
  promises: {
    achievementsPromise: Promise<listMyAchievementsResponse>;
  };
}

/**
 * Galeria de conquistas desbloqueadas e em progresso do explorador via React.use() + useMemo().
 */
export function AchievementsContent({ promises }: AchievementsContentProps) {
  const achievementsResponse = use(promises.achievementsPromise);

  const { desbloqueadas, emProgresso } = useMemo(() => {
    const items =
      achievementsResponse.status === 200
        ? (achievementsResponse.data ?? [])
        : [];

    const unlockedList: ProfileAchievement[] = items
      .filter((item) => item.isUnlocked)
      .map((item) => ({
        nome: item.name,
        descricao: item.description,
        criterio: item.description,
        atual: Number(item.currentProgress ?? item.requiredQuantity),
        meta: Number(item.requiredQuantity),
        badge: {
          id: item.id,
          name: item.name,
          trigger: "metric" as const,
          icon: resolveAchievementIcon(item.icon),
          color: item.color,
          progress: 100,
          rarity: 100,
          achievedAt: item.unlockedAt ?? "",
        },
      }));

    const lockedList: ProfileAchievement[] = items
      .filter((item) => !item.isUnlocked)
      .map((item) => {
        const currentProgress = Number(item.currentProgress ?? 0);
        const requiredQuantity = Math.max(1, Number(item.requiredQuantity ?? 1));
        const progressPercentage = Math.min(
          100,
          Math.round((currentProgress / requiredQuantity) * 100),
        );

        return {
          nome: item.name,
          descricao: item.description,
          criterio: item.description,
          atual: currentProgress,
          meta: requiredQuantity,
          badge: {
            id: item.id,
            name: item.name,
            trigger: "metric" as const,
            icon: resolveAchievementIcon(item.icon),
            color: item.color,
            progress: progressPercentage,
            rarity: progressPercentage,
            achievedAt: null,
          },
        };
      })
      .sort(
        (first, second) =>
          (second.badge.progress ?? 0) - (first.badge.progress ?? 0),
      );

    return {
      desbloqueadas: unlockedList,
      emProgresso: lockedList,
    };
  }, [achievementsResponse]);

  return (
    <div className="flex flex-col gap-8">
      {/* unlocked achievements - section */}
      <section className="flex flex-col gap-4">
        <h2 className="font-semibold text-lg">
          Desbloqueadas ({desbloqueadas.length})
        </h2>

        {desbloqueadas.length === 0 ? (
          <p className="rounded-xl border border-border border-dashed p-8 text-center text-muted-foreground text-sm">
            Nenhuma conquista desbloqueada ainda. Explore a cidade para
            desbloquear medalhas!
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {desbloqueadas.map((item) => (
              <Card key={item.badge.id} size="sm">
                <CardContent className="flex flex-col items-center gap-2 text-center">
                  <AchievementBadge achievement={item.badge} badgeSize="xl" />

                  <span className="text-muted-foreground text-xs">
                    {item.descricao}
                  </span>

                  {item.badge.achievedAt && (
                    <span className="text-muted-foreground text-xs">
                      Obtida em {formatVisitDate(item.badge.achievedAt)}
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* in progress achievements - section */}
      <section className="flex flex-col gap-4">
        <h2 className="font-semibold text-lg">
          Em progresso ({emProgresso.length})
        </h2>

        {emProgresso.length === 0 ? (
          <p className="rounded-xl border border-border border-dashed p-8 text-center text-muted-foreground text-sm">
            Nenhuma conquista em progresso no momento.
          </p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {emProgresso.map((item) => (
              <AchievementProgressCard key={item.badge.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
