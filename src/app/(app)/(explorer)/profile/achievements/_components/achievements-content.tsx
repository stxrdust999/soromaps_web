"use client";

import { type KeyboardEvent, use, useMemo, useState } from "react";

import { AchievementBadge } from "@/components/ui/achievement-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  resolveAchievementIcon,
  TRIGGER_LABEL,
} from "@/constants/achievements";
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
 * Permite inspecionar o progresso detalhado e critério de desbloqueio em modal informativo.
 */
export function AchievementsContent({ promises }: AchievementsContentProps) {
  const achievementsResponse = use(promises.achievementsPromise);
  const [selectedProgressItem, setSelectedProgressItem] =
    useState<ProfileAchievement | null>(null);

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
        meta: Math.max(1, Number(item.requiredQuantity ?? 1)),
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

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    achievementItem: ProfileAchievement,
  ) => {
    if (event.key !== "Enter" && event.key !== " ")
      return;

    event.preventDefault();
    setSelectedProgressItem(achievementItem);
  };

  const selectedPercentage = selectedProgressItem
    ? Math.min(
        100,
        Math.round(
          (selectedProgressItem.atual / Math.max(1, selectedProgressItem.meta)) *
            100,
        ),
      )
    : 0;

  const remainingSteps = selectedProgressItem
    ? Math.max(0, selectedProgressItem.meta - selectedProgressItem.atual)
    : 0;

  const isSelectedUnlocked = Boolean(selectedProgressItem?.badge.achievedAt);

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
              <Card
                key={item.badge.id}
                size="sm"
                role="button"
                tabIndex={0}
                onClick={() => setSelectedProgressItem(item)}
                onKeyDown={(event) => handleCardKeyDown(event, item)}
                className="cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/30"
              >
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
              <AchievementProgressCard
                key={item.badge.id}
                item={item}
                onSelect={setSelectedProgressItem}
              />
            ))}
          </div>
        )}
      </section>

      {/* achievement details - dialog */}
      <Dialog
        open={Boolean(selectedProgressItem)}
        onOpenChange={(open) => {
          if (!open)
            setSelectedProgressItem(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          {selectedProgressItem && (
            <>
              <DialogHeader className="items-center text-center sm:text-center">
                <AchievementBadge
                  achievement={selectedProgressItem.badge}
                  badgeSize="lg"
                  layout="icon"
                />

                <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                  <Badge variant="outline">
                    {TRIGGER_LABEL[selectedProgressItem.badge.trigger].label}
                  </Badge>
                  <Badge
                    variant={isSelectedUnlocked ? "default" : "secondary"}
                  >
                    {isSelectedUnlocked ? "Desbloqueada" : "Em progresso"}
                  </Badge>
                </div>

                <DialogTitle className="mt-1 text-base font-semibold">
                  {selectedProgressItem.nome}
                </DialogTitle>

                <DialogDescription>
                  {selectedProgressItem.descricao}
                </DialogDescription>
              </DialogHeader>

              {/* progress breakdown - section */}
              <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-muted-foreground">
                    Progresso atual
                  </span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {selectedProgressItem.atual} de {selectedProgressItem.meta} (
                    {selectedPercentage}%)
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground transition-all"
                    style={{ width: `${selectedPercentage}%` }}
                  />
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <span className="text-muted-foreground">
                    <strong className="font-medium text-foreground">
                      Critério:
                    </strong>{" "}
                    {selectedProgressItem.criterio}
                  </span>

                  <span className="font-medium text-muted-foreground">
                    {isSelectedUnlocked && selectedProgressItem.badge.achievedAt
                      ? `Conquista desbloqueada em ${formatVisitDate(selectedProgressItem.badge.achievedAt)}.`
                      : `Faltam ${remainingSteps} etapa(s) para desbloquear esta conquista.`}
                  </span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
