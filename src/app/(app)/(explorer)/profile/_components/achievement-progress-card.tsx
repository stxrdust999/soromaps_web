import { AchievementBadge } from "@/components/ui/achievement-badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ProfileAchievement } from "@/types/profile";

interface AchievementProgressCardProps {
  item: ProfileAchievement;
}

/**
 * Conquista travada com o critério e o quanto falta.
 *
 * Mostrar o progresso é o que separa galeria de vitrine: badge cinza sem
 * número diz que você não tem; com número, diz o que fazer.
 */
export function AchievementProgressCard({
  item,
}: AchievementProgressCardProps) {
  const percent = item.badge.progress ?? 0;

  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-4">
        <AchievementBadge
          achievement={item.badge}
          badgeSize="lg"
          layout="icon"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="truncate font-semibold text-sm">{item.nome}</span>

          <span className="text-muted-foreground text-xs">{item.criterio}</span>

          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground"
              style={{ width: `${percent}%` }}
            />
          </div>

          <span className="text-muted-foreground text-xs tabular-nums">
            {item.atual} de {item.meta}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
