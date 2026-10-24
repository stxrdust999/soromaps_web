"use client";

import { use, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageSection } from "@/components/blocks/page-section";
import { RemovalDialog } from "@/components/blocks/removal-dialog";
import { SiteFooter } from "@/components/blocks/site-footer";
import type { RemovalReason } from "@/constants/content-removal";
import type { adminListReviewsResponse } from "@/http/admin-reviews/admin-reviews";
import type { ReviewMock } from "@/types/reviews";

import { ReviewsStats } from "./reviews-stats";
import { ReviewsTable } from "./reviews-table";
import { mapAdminReviewDtoToMock, useReviews } from "./use-reviews";

interface PendingRemoval {
  reviews: ReviewMock[];
  clearSelection?: () => void;
}

interface ReviewsWorkspaceProps {
  promises: {
    reviewsPromise: Promise<adminListReviewsResponse>;
  };
}

/**
 * Listagem administrativa de avaliações integrada via Streaming SSR (`use()` + `useMemo()`).
 */
export function ReviewsWorkspace({ promises }: ReviewsWorkspaceProps) {
  const reviewsResponse = use(promises.reviewsPromise);

  const initialReviews = useMemo<ReviewMock[]>(() => {
    if (reviewsResponse.status === 200 && reviewsResponse.data.items)
      return reviewsResponse.data.items.map(mapAdminReviewDtoToMock);
    return [];
  }, [reviewsResponse]);

  const { reviews, signalsById, stats, remove } = useReviews(initialReviews);

  const [pending, setPending] = useState<PendingRemoval | null>(null);

  const actions = useMemo(
    () => ({
      onRemove: (review: ReviewMock) => setPending({ reviews: [review] }),
    }),
    [],
  );

  const onRemoveSelected = useCallback(
    (selected: ReviewMock[], clearSelection: () => void) => {
      setPending({ reviews: selected, clearSelection });
    },
    [],
  );

  function confirmRemoval(motivo: RemovalReason) {
    if (!pending) return;

    const count = pending.reviews.length;

    remove(
      pending.reviews.map((review) => review.id),
      motivo,
    );
    pending.clearSelection?.();
    setPending(null);

    toast.success(
      count === 1
        ? `Avaliação removida (${motivo})`
        : `${count} avaliações removidas (${motivo})`,
      { description: "Saíram da vitrine e continuam auditáveis aqui." },
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      {/* reviews - section */}
      <PageSection
        title="Avaliações"
        description="Todas as avaliações da plataforma, fora do contexto do local"
        className="gap-6"
        subitems={
          <ReviewsStats
            publicadas={stats.publicadas}
            notaMedia={stats.notaMedia}
            removidas={stats.removidas}
            comSinal={stats.comSinal}
          />
        }
      >
        <ReviewsTable
          reviews={reviews}
          signalsById={signalsById}
          actions={actions}
          onRemoveSelected={onRemoveSelected}
        />
      </PageSection>

      <SiteFooter />

      {pending && (
        <RemovalDialog
          subject={
            pending.reviews.length === 1
              ? `avaliação de ${pending.reviews[0].local.nome}`
              : "avaliações"
          }
          count={pending.reviews.length}
          onOpenChange={(open) => !open && setPending(null)}
          onConfirm={confirmRemoval}
        />
      )}
    </main>
  );
}
