import { AchievementBadge } from "@/components/ui/achievement-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type FeedConquistaItem, feedItemDate } from "@/types/feed";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";

const VISIBLE_LIMIT = 6;

interface RecentAchievementsProps {
  items: FeedConquistaItem[];
}

/**
 * Conquistas recentes desbloqueadas na comunidade.
 */
export function RecentAchievements({ items }: RecentAchievementsProps) {
  const recent = [...items]
    .sort((first, second) => first.diasAtras - second.diasAtras)
    .slice(0, VISIBLE_LIMIT);

  if (recent.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      {/* header - title */}
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-semibold text-lg">Conquistas recentes</h2>
        <span className="text-muted-foreground text-xs">
          quem desbloqueou o quê pela cidade
        </span>
      </div>

      {/* achievements - strip */}
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {recent.map((item) => (
          <div
            key={item.id}
            className="flex w-64 shrink-0 items-center gap-3 rounded-2xl border border-border bg-card p-3"
          >
            <AchievementBadge
              layout="icon"
              badgeSize="sm"
              achievement={{
                id: item.id,
                name: item.conquista.nome,
                trigger: "metric",
                icon: item.conquista.icon,
                color: item.conquista.cor,
                achievedAt: feedItemDate(item.diasAtras),
              }}
            />

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Avatar
                  className="size-4"
                  identifier={item.autor.id ?? item.autor.nome}
                >
                  {item.autor.avatarUrl && (
                    <AvatarImage
                      src={item.autor.avatarUrl}
                      alt={item.autor.nome}
                    />
                  )}
                  <AvatarFallback className="text-[8px]">
                    {item.autor.iniciais}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate font-medium text-xs">
                  {item.autor.nome}
                </span>
              </div>

              <span className="truncate font-semibold text-sm">
                {item.conquista.nome}
              </span>

              <span className="truncate text-muted-foreground text-xs">
                {formatWaitingDays(item.diasAtras)}
                {item.local && ` · ${item.local.nome}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
