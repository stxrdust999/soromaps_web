"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { removeContentAction } from "@/actions/reviews";
import type { RemovalReason } from "@/constants/content-removal";
import { explorerCredential } from "@/constants/explorer-titles";
import { adminListReviews } from "@/http/admin-reviews/admin-reviews";
import type { AdminReviewItemDto } from "@/http/api.schemas";
import type { ReviewMock } from "@/types/reviews";

const DISCREPANCY_THRESHOLD = 2.5;
const MIN_REVIEWS_FOR_AVERAGE = 4;

export type ReviewSignalKind = "spam" | "duplicada" | "discrepante";

export interface ReviewSignal {
  kind: ReviewSignalKind;
  label: string;
  tone: "bad" | "warn";
}

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

function averageByPlace(reviews: ReviewMock[]): Map<string, number> {
  const totals = new Map<string, { soma: number; contagem: number }>();

  for (const review of reviews) {
    if (review.status !== "publicada") continue;

    const current = totals.get(review.local.id) ?? { soma: 0, contagem: 0 };
    totals.set(review.local.id, {
      soma: current.soma + review.nota,
      contagem: current.contagem + 1,
    });
  }

  return new Map(
    [...totals.entries()]
      .filter(([, { contagem }]) => contagem >= MIN_REVIEWS_FOR_AVERAGE)
      .map(([id, { soma, contagem }]) => [id, soma / contagem]),
  );
}

/**
 * Converte um `AdminReviewItemDto` retornado pela API para o contrato `ReviewMock`.
 */
export function mapAdminReviewDtoToMock(dto: AdminReviewItemDto): ReviewMock {
  const diffDays = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(dto.createdAt).getTime()) / (1000 * 60 * 60 * 24),
    ),
  );
  const authorName = dto.author?.name ?? "Explorador";
  const initials =
    authorName
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "EX";
  return {
    id: dto.id,
    autorId: dto.author?.id ?? `author-${dto.id}`,
    autor: {
      id: dto.author?.id ?? `author-${dto.id}`,
      nome: authorName,
      iniciais: initials,
      titulo: explorerCredential(1),
      avatarUrl: dto.author?.avatarUrl ?? undefined,
    },
    local: {
      id: dto.placeId,
      nome: dto.placeName,
      bairro: "Sorocaba",
      categoria: "Local",
    },
    nota: parseNumeric(dto.rating, 5),
    placeRatingAverage: parseNumeric(dto.placeRatingAverage, 0),
    corpo: dto.content,
    diasPublicado: diffDays,
    status: "publicada",
    spam: dto.signals?.includes("spam"),
    signals: dto.signals ?? [],
    comentarios: [],
  };
}

/**
 * Categorias formais de problema numa avaliação.
 */
export function getReviewSignals(
  review: ReviewMock,
  reviews: ReviewMock[],
  averages: Map<string, number>,
): ReviewSignal[] {
  const signals: ReviewSignal[] = [];

  if (review.spam || review.signals?.includes("spam")) {
    signals.push({ kind: "spam", label: "Suspeita de spam", tone: "bad" });
  }

  const duplicated =
    review.signals?.includes("duplicate") ||
    reviews.some(
      (other) =>
        other.id !== review.id &&
        other.autorId === review.autorId &&
        other.local.id === review.local.id,
    );

  if (duplicated) {
    signals.push({ kind: "duplicada", label: "Duplicada", tone: "warn" });
  }

  const average = averages.get(review.local.id) ?? review.placeRatingAverage;

  if (
    review.signals?.includes("discrepant") ||
    (average !== undefined &&
      average > 0 &&
      Math.abs(review.nota - average) >= DISCREPANCY_THRESHOLD)
  ) {
    signals.push({ kind: "discrepante", label: "Discrepante", tone: "warn" });
  }

  return signals;
}

/**
 * Estado da listagem administrativa de avaliações integrado à API real.
 */
export function useReviews(initialReviews: ReviewMock[] = []) {
  const [reviews, setReviews] = useState<ReviewMock[]>(initialReviews);

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  const reload = useCallback(async () => {
    try {
      const response = await adminListReviews({ Page: 1, PageSize: 100 });
      if (response.status === 200 && response.data.items) {
        setReviews(response.data.items.map(mapAdminReviewDtoToMock));
      }
    } catch (error) {
      console.error("Erro ao carregar avaliações administrativas:", error);
    }
  }, []);

  const averages = useMemo(() => averageByPlace(reviews), [reviews]);

  const signalsById = useMemo(() => {
    return new Map(
      reviews.map((review) => [
        review.id,
        getReviewSignals(review, reviews, averages),
      ]),
    );
  }, [reviews, averages]);

  const stats = useMemo(() => {
    const published = reviews.filter((review) => review.status === "publicada");

    const average = published.length
      ? published.reduce((sum, review) => sum + review.nota, 0) /
        published.length
      : 0;

    return {
      publicadas: published.length,
      notaMedia: average,
      removidas: reviews.filter((review) => review.status === "removida")
        .length,
      comSinal: published.filter(
        (review) => (signalsById.get(review.id)?.length ?? 0) > 0,
      ).length,
    };
  }, [reviews, signalsById]);

  const remove = useCallback(async (ids: string[], motivo: RemovalReason) => {
    const alvo = new Set(ids);

    setReviews((current) =>
      current.map((review) =>
        alvo.has(review.id)
          ? {
              ...review,
              status: "removida" as const,
              removidaPor: "Admin",
              motivoRemocao: motivo,
            }
          : review,
      ),
    );

    for (const id of ids) {
      const result = await removeContentAction("review", id, motivo);
      if (!result.success) toast.error(result.message);
    }
  }, []);

  const restore = useCallback((id: string) => {
    setReviews((current) =>
      current.map((review) =>
        review.id === id
          ? {
              ...review,
              status: "publicada" as const,
              removidaPor: undefined,
              motivoRemocao: undefined,
            }
          : review,
      ),
    );
  }, []);

  return { reviews, signalsById, stats, remove, restore, reload };
}

export type { ReviewMock };
