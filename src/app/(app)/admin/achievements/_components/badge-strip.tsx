"use client";

import { AchievementBadge } from "@/components/ui/achievement-badge";
import type { AchievementMock } from "@/types/achievements";

import { triggerOf } from "./use-achievements";

interface BadgeStripProps {
  achievements: AchievementMock[];
  onSelect: (achievement: AchievementMock) => void;
}

/**
 * Todos os badges ativos juntos.
 *
 * A coleção só se julga inteira: uma linha por vez esconde que dois badges
 * separados por cinco posições na tabela usam o mesmo azul com ícones
 * parecidos. Mesma função da faixa "Conjunto no mapa" das categorias.
 *
 * Conquista zerada aparece **travada** de propósito — no conjunto, o que
 * ninguém tirou é exatamente o que precisa saltar.
 */
export function BadgeStrip({ achievements, onSelect }: BadgeStripProps) {
  const active = achievements.filter((item) => item.ativa);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground text-sm">
          Conjunto de badges · {active.length} ativas
        </span>
        <span className="text-muted-foreground text-xs">
          Como a coleção se lê junta, não uma linha por vez
        </span>
      </div>

      <ul className="bg-muted/30 flex flex-wrap gap-x-5 gap-y-4 rounded-xl border p-5">
        {active.map((achievement) => (
          <li key={achievement.id} className="w-24">
            <AchievementBadge
              badgeSize="default"
              achievement={{
                id: achievement.id,
                name: achievement.nome,
                trigger: triggerOf(achievement),
                icon: achievement.icone,
                color: achievement.cor,
                achievedAt: achievement.obtencoes > 0 ? "hoje" : null,
              }}
              onAchievementClick={() => onSelect(achievement)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
