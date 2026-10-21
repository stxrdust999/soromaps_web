"use client";

import { MessageSquareIcon, SendIcon, StarIcon, ThumbsUpIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createCommentAction } from "@/actions/comments";
import {
  createReviewAction,
  deleteReviewAction,
  toggleReviewUsefulVoteAction,
} from "@/actions/reviews";
import { StarRating } from "@/components/blocks/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewResponseDto } from "@/http/api.schemas";

interface PlaceReviewsSectionProps {
  placeId: string;
  initialReviews: ReviewResponseDto[];
  currentUserId?: string;
}

/**
 * Community reviews and comments feed for a place.
 */
export function PlaceReviewsSection({
  placeId,
  initialReviews,
  currentUserId,
}: PlaceReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewResponseDto[]>(initialReviews);
  const [newContent, setNewContent] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [activeReplyReviewId, setActiveReplyReviewId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreateReview = () => {
    if (!newContent.trim()) {
      toast.error("Escreva um texto para sua avaliação.");
      return;
    }

    startTransition(async () => {
      const result = await createReviewAction(placeId, {
        rating: newRating,
        content: newContent,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setNewContent("");

      const optimisticReview: ReviewResponseDto = {
        id: result.reviewId ?? `review-${Date.now()}`,
        placeId,
        rating: newRating,
        content: newContent,
        usefulVotesCount: 0,
        markedUsefulByMe: false,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: currentUserId ?? "me",
          name: "Você",
          avatarUrl: null,
          achievementsCount: 1,
          isVerifiedExplorer: false,
          visitedPlace: true,
        },
      };

      setReviews([optimisticReview, ...reviews]);
    });
  };

  const handleToggleUseful = (review: ReviewResponseDto) => {
    startTransition(async () => {
      const isUseful = review.markedUsefulByMe;
      const prevUseful = isUseful;
      const count =
        typeof review.usefulVotesCount === "string"
          ? parseInt(review.usefulVotesCount, 10)
          : review.usefulVotesCount;

      setReviews((current) =>
        current.map((r) =>
          r.id === review.id
            ? {
                ...r,
                markedUsefulByMe: !prevUseful,
                usefulVotesCount: prevUseful ? Math.max(0, count - 1) : count + 1,
              }
            : r,
        ),
      );

      const result = await toggleReviewUsefulVoteAction(
        review.id,
        placeId,
        prevUseful,
      );

      if (!result.success) {
        toast.error(result.message);
        setReviews((current) =>
          current.map((r) =>
            r.id === review.id
              ? {
                  ...r,
                  markedUsefulByMe: prevUseful,
                  usefulVotesCount: count,
                }
              : r,
          ),
        );
      }
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    startTransition(async () => {
      const result = await deleteReviewAction(reviewId, placeId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setReviews((current) => current.filter((r) => r.id !== reviewId));
    });
  };

  const handleSendComment = (reviewId: string) => {
    if (!replyContent.trim()) return;

    startTransition(async () => {
      const result = await createCommentAction(reviewId, placeId, replyContent);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setReplyContent("");
      setActiveReplyReviewId(null);

      setReviews((current) =>
        current.map((r) => {
          if (r.id !== reviewId) return r;
          const count =
            typeof r.commentsCount === "string"
              ? parseInt(r.commentsCount, 10)
              : r.commentsCount;
          return { ...r, commentsCount: count + 1 };
        }),
      );
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xl font-semibold">Avaliações da Comunidade</span>
        <Separator />
      </div>

      {/* Form de nova avaliação */}
      <div className="rounded-xl border bg-card p-4 flex flex-col gap-3 shadow-xs">
        <span className="font-medium text-sm">Deixe sua avaliação</span>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setNewRating(star)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <StarIcon
                className={`size-5 ${
                  star <= newRating
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
          <span className="text-xs text-muted-foreground ml-2 font-mono">
            {newRating} de 5 estrelas
          </span>
        </div>

        <Textarea
          placeholder="Conte como foi sua experiência, o que pedir ou quando visitar..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={3}
          className="resize-none text-sm"
        />

        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleCreateReview}
            disabled={isPending || !newContent.trim()}
          >
            <SendIcon className="size-3.5" />
            Publicar avaliação
          </Button>
        </div>
      </div>

      {/* Lista de avaliações */}
      <div className="flex flex-col gap-4">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm border border-dashed rounded-xl p-8 text-center">
            Seja o primeiro a avaliar este local!
          </p>
        ) : (
          reviews.map((review) => {
            const author = review.author;
            const initials = author?.name
              ? author.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "EX";
            const ratingNumber =
              typeof review.rating === "string"
                ? parseFloat(review.rating)
                : review.rating;
            const usefulCount =
              typeof review.usefulVotesCount === "string"
                ? parseInt(review.usefulVotesCount, 10)
                : review.usefulVotesCount;
            const commentsCount =
              typeof review.commentsCount === "string"
                ? parseInt(review.commentsCount, 10)
                : review.commentsCount;

            return (
              <div
                key={review.id}
                className="rounded-xl border bg-card p-4 flex flex-col gap-3 shadow-xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-8">
                      <AvatarImage src={author?.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm">
                          {author?.name ?? "Explorador"}
                        </span>
                        {author?.isVerifiedExplorer && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                            Verificado
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  <StarRating nota={ratingNumber} size={14} />
                </div>

                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {review.content}
                </p>

                <div className="flex items-center justify-between border-t pt-2.5 mt-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={review.markedUsefulByMe ? "secondary" : "ghost"}
                      size="xs"
                      onClick={() => handleToggleUseful(review)}
                      className="gap-1 text-xs h-7"
                    >
                      <ThumbsUpIcon
                        className={`size-3 ${
                          review.markedUsefulByMe ? "fill-primary text-primary" : ""
                        }`}
                      />
                      <span>Útil ({usefulCount})</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() =>
                        setActiveReplyReviewId(
                          activeReplyReviewId === review.id ? null : review.id,
                        )
                      }
                      className="gap-1 text-xs h-7"
                    >
                      <MessageSquareIcon className="size-3" />
                      <span>Comentários ({commentsCount})</span>
                    </Button>
                  </div>

                  {currentUserId && author?.id === currentUserId && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-destructive hover:text-destructive h-7"
                    >
                      Excluir
                    </Button>
                  )}
                </div>

                {/* Caixa de resposta ativa */}
                {activeReplyReviewId === review.id && (
                  <div className="mt-2 flex flex-col gap-2 rounded-lg bg-muted/50 p-2.5">
                    <Textarea
                      placeholder="Escreva uma resposta ou comentário..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={2}
                      className="resize-none text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setActiveReplyReviewId(null)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="xs"
                        onClick={() => handleSendComment(review.id)}
                        disabled={isPending || !replyContent.trim()}
                      >
                        Responder
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
