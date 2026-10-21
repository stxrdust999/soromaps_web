"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { removeContentAction } from "@/actions/reviews";
import type { RemovalReason } from "@/constants/content-removal";
import type { AdminReviewItemDto } from "@/http/api.schemas";
import { adminListReviews } from "@/http/admin-reviews/admin-reviews";
import { type ReviewMock, reviewsMock } from "@/mocks/admin-reviews";

/**
 * Distância mínima entre a nota e a média do local para a avaliação contar
 * como discrepante. 2,5 é meia escala: separa "gostei menos que a maioria" de
 * "avaliei outro lugar".
 */
const DISCREPANCY_THRESHOLD = 2.5;

/**
 * Abaixo disto a média do local não tem massa para servir de referência —
 * duas avaliações fazem qualquer terceira parecer discrepante.
 */
const MIN_REVIEWS_FOR_AVERAGE = 4;

export type ReviewSignalKind = "spam" | "duplicada" | "discrepante";

export interface ReviewSignal {
  kind: ReviewSignalKind;
  label: string;
  /** `bad` costuma virar remoção; `warn` pede leitura antes de decidir. */
  tone: "bad" | "warn";
}

/** Média das avaliações publicadas de cada local. */
function averageByPlace(reviews: ReviewMock[]): Map<number | string, number> {
  const totals = new Map<number | string, { soma: number; contagem: number }>();

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
 * Converte item retornado por adminListReviews para ReviewMock.
 */
function mapAdminReviewDtoToMock(dto: AdminReviewItemDto): ReviewMock {
  const diffDays = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(dto.createdAt).getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  return {
    id: dto.id,
    autorId: "ana",
    local: {
      id: dto.placeId as any,
      nome: dto.placeName,
      bairro: "Sorocaba",
      categoria: "Local",
    },
    nota: typeof dto.rating === "string" ? parseFloat(dto.rating) : dto.rating,
    corpo: dto.content,
    diasPublicado: diffDays,
    status: "publicada",
    spam: dto.signals?.includes("spam"),
    comentarios: [],
  };
}

/**
 * Categorias formais de problema numa avaliação.
 */
export function getReviewSignals(
  review: ReviewMock,
  reviews: ReviewMock[],
  averages: Map<number | string, number>,
): ReviewSignal[] {
  const signals: ReviewSignal[] = [];

  if (review.spam) {
    signals.push({ kind: "spam", label: "Suspeita de spam", tone: "bad" });
  }

  const duplicated = reviews.some(
    (other) =>
      other.id !== review.id &&
      other.autorId === review.autorId &&
      other.local.id === review.local.id,
  );

  if (duplicated) {
    signals.push({ kind: "duplicada", label: "Duplicada", tone: "warn" });
  }

  const average = averages.get(review.local.id);

  if (
    average !== undefined &&
    Math.abs(review.nota - average) >= DISCREPANCY_THRESHOLD
  ) {
    signals.push({ kind: "discrepante", label: "Discrepante", tone: "warn" });
  }

  return signals;
}

/**
 * Estado da listagem administrativa de avaliações integrado à API real.
 */
export function useReviews() {
  const [reviews, setReviews] = useState<ReviewMock[]>(reviewsMock);

  const reload = useCallback(async () => {
    try {
      const response = await adminListReviews({ Page: 1, PageSize: 100 });
      if (response.status === 200 && response.data.items && response.data.items.length > 0) {
        setReviews(response.data.items.map(mapAdminReviewDtoToMock));
      }
    } catch (error) {
      console.error("Erro ao carregar avaliações administrativas:", error);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

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
    const published = reviews.filter((r) => r.status === "publicada");

    const average = published.length
      ? published.reduce((sum, r) => sum + r.nota, 0) / published.length
      : 0;

    return {
      publicadas: published.length,
      notaMedia: average,
      removidas: reviews.filter((r) => r.status === "removida").length,
      comSinal: published.filter(
        (r) => (signalsById.get(r.id)?.length ?? 0) > 0,
      ).length,
    };
  }, [reviews, signalsById]);

  /** Marca como removida com auditoria na API. */
  const remove = useCallback(
    async (ids: string[], motivo: RemovalReason) => {
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
        if (!result.success) {
          toast.error(result.message);
        }
      }
    },
    [],
  );

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
