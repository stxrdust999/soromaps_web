import { AchievementBadge } from "@/components/ui/achievement-badge";
import { Card, CardContent } from "@/components/ui/card";
import { MY_ACHIEVEMENTS_TAG } from "@/constants/achievements";
import { listMyAchievements } from "@/http/achievements/achievements";
import {
  formatVisitDate,
  profileLockedAchievements,
  profileUnlockedAchievements,
} from "@/mocks/profile";

import { AchievementProgressCard } from "../_components/achievement-progress-card";

/**
 * Carrega conquistas do explorador autenticado via API com fallback para mocks.
 */
async function loadAchievementsData() {
  try {
    const res = await listMyAchievements({ next: { tags: [MY_ACHIEVEMENTS_TAG] } });
    if (res.status === 200 && res.data.length > 0) {
      const items = res.data;
      const desbloqueadas = items
        .filter((i) => i.isUnlocked)
        .map((i) => ({
          badge: {
            id: i.id,
            name: i.name,
            title: i.name,
            description: i.description,
            icon: (i.icon as any) ?? "sparkles",
            accentColor: i.color,
            achievedAt: i.unlockedAt ?? "",
            trigger: "metric" as const,
          },
          descricao: i.description,
        }));

      const emProgresso = items
        .filter((i) => !i.isUnlocked)
        .map((i) => {
          const current = Number(i.currentProgress);
          const req = Number(i.requiredQuantity);
          const progress = req > 0 ? Math.round((current / req) * 100) : 0;
          return {
            id: i.id,
            nome: i.name,
            descricao: i.description,
            criterio: i.description,
            meta: req,
            atual: current,
            badge: {
              id: i.id,
              name: i.name,
              title: i.name,
              description: i.description,
              icon: (i.icon as any) ?? "sparkles",
              accentColor: i.color,
              progress,
              trigger: "metric" as const,
              achievedAt: null,
            },
          };
        });

      return { desbloqueadas, emProgresso };
    }
  } catch {
    // Fallback silencioso
  }

  return {
    desbloqueadas: profileUnlockedAchievements(),
    emProgresso: profileLockedAchievements(),
  };
}

/**
 * Galeria de conquistas do explorador autenticado.
 */
export default async function ProfileAchievementsPage() {
  const { desbloqueadas, emProgresso } = await loadAchievementsData();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="font-semibold text-lg">
          Desbloqueadas ({desbloqueadas.length})
        </h2>

        {desbloqueadas.length === 0 ? (
          <p className="rounded-xl border border-border border-dashed p-8 text-center text-muted-foreground text-sm">
            Nenhuma conquista desbloqueada ainda. Explore a cidade para desbloquear medalhas!
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
