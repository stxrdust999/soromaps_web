import { resolveAchievementIcon } from "@/constants/achievements";
import type { FeedReason } from "@/constants/feed";
import type { FeedItemDto } from "@/http/api.schemas";
import type { FeedAuthor, FeedItemView, FeedPlaceView } from "@/types/feed";

const DEFAULT_PLACE_PHOTO =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80";

function parseNumeric(
  value: number | string | null | undefined,
  fallback = 0,
): number {
  if (typeof value === "number")
    return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function normalizeColor(color?: string | null): string {
  return color && color.trim() ? color : "#1447e6";
}

function normalizeReason(reason?: string | null): FeedReason {
  if (
    reason === "perto" ||
    reason === "salvo" ||
    reason === "categoria" ||
    reason === "cidade" ||
    reason === "curadoria"
  ) {
    return reason;
  }
  if (reason === "neighborhood") return "perto";
  if (reason === "favorite") return "salvo";
  if (reason === "category") return "categoria";
  if (reason === "editorial") return "curadoria";
  return "cidade";
}

function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "12:00";
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildAuthor(item: FeedItemDto): FeedAuthor {
  const authorName = item.author?.name ?? "Explorador";
  const initials =
    authorName
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "EX";

  return {
    id: item.author?.id ?? `author-${item.id}`,
    nome: authorName,
    iniciais: initials,
    avatarUrl: item.author?.avatarUrl ?? undefined,
    verificado: false,
    conquistas: parseNumeric(item.authorAchievementsCount, 1),
  };
}

function buildPlace(
  item: FeedItemDto,
  defaultNeighborhood: string,
): FeedPlaceView {
  return {
    id: item.placeId ?? item.id,
    nome: item.placeName ?? item.title,
    categoria: item.categoryName ?? "Local",
    bairro: item.neighborhood ?? defaultNeighborhood,
    fotoUrl: item.imageUrl ?? DEFAULT_PLACE_PHOTO,
  };
}

/**
 * Converte um `FeedItemDto` da API para o contrato de UI `FeedItemView`.
 */
export function mapFeedItemDtoToView(item: FeedItemDto): FeedItemView | null {
  const diasAtras = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(item.occurredAt).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
  const hora = formatTime(item.occurredAt);
  const bairro = item.neighborhood ?? "Sorocaba";
  const motivo = normalizeReason(item.reason);
  const relevancia = Math.max(10, 95 - diasAtras * 5);

  if (item.kind === "review") {
    return {
      id: item.id,
      reviewId: item.reviewId ?? item.id,
      kind: "avaliacao",
      bairro,
      diasAtras,
      hora,
      motivo,
      motivoDetalhe: bairro,
      relevancia,
      autor: buildAuthor(item),
      local: buildPlace(item, bairro),
      nota: parseNumeric(item.rating, 5),
      corpo: item.description ?? "",
      fotoUrl: item.imageUrl ?? undefined,
      uteis: parseNumeric(item.usefulVotesCount, 0),
      markedUsefulByMe: Boolean(item.markedUsefulByMe),
    };
  }

  if (item.kind === "new_place") {
    return {
      id: item.id,
      kind: "novo-ponto",
      bairro,
      diasAtras,
      hora,
      motivo,
      motivoDetalhe: item.categoryName ?? bairro,
      relevancia,
      autor: buildAuthor(item),
      local: buildPlace(item, bairro),
      sobre: item.description ?? "",
    };
  }

  if (item.kind === "story") {
    const place = buildPlace(item, bairro);
    return {
      id: item.id,
      kind: "curadoria",
      bairro,
      diasAtras,
      hora,
      motivo: "curadoria",
      relevancia,
      slug: item.storySlug ?? item.id,
      titulo: item.title,
      chamada: item.description ?? "",
      fotoUrl: item.imageUrl ?? DEFAULT_PLACE_PHOTO,
      editor: item.author?.name ?? "Equipe Soromaps",
      locais: item.placeId ? [place] : [],
    };
  }

  if (item.kind === "place_burst") {
    const total = parseNumeric(item.visitsCount, 3);
    return {
      id: item.id,
      kind: "movimento",
      bairro,
      diasAtras,
      hora,
      motivo,
      motivoDetalhe: item.placeName ?? bairro,
      relevancia,
      local: buildPlace(item, bairro),
      tipo: "visitas",
      total,
      participantes: [buildAuthor(item)],
      janela: "nesta semana",
    };
  }

  if (item.kind === "rare_achievement") {
    return {
      id: item.id,
      kind: "conquista",
      bairro,
      diasAtras,
      hora,
      motivo,
      relevancia,
      autor: buildAuthor(item),
      conquista: {
        nome: item.achievement?.name ?? item.title,
        cor: normalizeColor(item.achievement?.color),
        icon: resolveAchievementIcon(item.achievement?.icon ?? undefined),
        criterio: item.achievement?.description ?? item.description ?? "",
      },
      local: item.placeId ? buildPlace(item, bairro) : undefined,
    };
  }

  return null;
}

