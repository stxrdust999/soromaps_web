"use client";

import {
  FlagIcon,
  Loader2Icon,
  MessageSquareIcon,
  SendIcon,
  StarIcon,
  ThumbsUpIcon,
  Trash2Icon,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createCommentAction,
  deleteCommentAction,
  listReviewCommentsAction,
} from "@/actions/comments";
import {
  createReviewAction,
  deleteReviewAction,
  toggleReviewUsefulVoteAction,
} from "@/actions/reviews";
import { ReportDialog } from "@/components/blocks/report-dialog";
import { StarRating } from "@/components/blocks/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { CommentResponseDto, ReviewResponseDto } from "@/http/api.schemas";

interface PlaceReviewsSectionProps {
  placeId: string;
  initialReviews: ReviewResponseDto[];
  currentUserId?: string;
}

/**
 * Seção de avaliações e comentários da comunidade de um local.
 */
export function PlaceReviewsSection({
  placeId,
  initialReviews,
  currentUserId,
}: PlaceReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewResponseDto[]>(initialReviews);
  const [newContent, setNewContent] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [activeReplyReviewId, setActiveReplyReviewId] = useState<string | null>(
    null,
  );
  const [replyContent, setReplyContent] = useState("");
  const [commentsByReview, setCommentsByReview] = useState<
    Record<string, CommentResponseDto[]>
  >({});
  const [loadingCommentsReviewId, setLoadingCommentsReviewId] = useState<
    string | null
  >(null);
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
      const previousUseful = review.markedUsefulByMe;
      const count =
        typeof review.usefulVotesCount === "string"
          ? parseInt(review.usefulVotesCount, 10)
          : review.usefulVotesCount;

      setReviews((current) =>
        current.map((currentReview) =>
          currentReview.id === review.id
            ? {
                ...currentReview,
                markedUsefulByMe: !previousUseful,
                usefulVotesCount: previousUseful
                  ? Math.max(0, count - 1)
                  : count + 1,
              }
            : currentReview,
        ),
      );

      const result = await toggleReviewUsefulVoteAction(
        review.id,
        placeId,
        previousUseful,
      );

      if (!result.success) {
        toast.error(result.message);
        setReviews((current) =>
          current.map((currentReview) =>
            currentReview.id === review.id
              ? {
                  ...currentReview,
                  markedUsefulByMe: previousUseful,
                  usefulVotesCount: count,
                }
              : currentReview,
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
      setReviews((current) =>
        current.filter((currentReview) => currentReview.id !== reviewId),
      );
    });
  };

  const handleToggleCommentsSection = async (reviewId: string) => {
    if (activeReplyReviewId === reviewId) {
      setActiveReplyReviewId(null);
      return;
    }

    setActiveReplyReviewId(reviewId);

    if (!commentsByReview[reviewId]) {
      setLoadingCommentsReviewId(reviewId);
      const fetchedComments = await listReviewCommentsAction(reviewId);
      setCommentsByReview((previous) => ({
        ...previous,
        [reviewId]: fetchedComments,
      }));
      setLoadingCommentsReviewId(null);
    }
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
      const nowIso = new Date().toISOString();
      const createdComment: CommentResponseDto = {
        id: result.commentId ?? `comment-${Date.now()}`,
        reviewId,
        replyToId: null,
        content: replyContent,
        createdAt: nowIso,
        updatedAt: nowIso,
        author: {
          id: currentUserId ?? "me",
          name: "Você",
          avatarUrl: null,
        },
      };

      setReplyContent("");
      setCommentsByReview((previous) => ({
        ...previous,
        [reviewId]: [...(previous[reviewId] ?? []), createdComment],
      }));

      setReviews((current) =>
        current.map((currentReview) => {
          if (currentReview.id !== reviewId) return currentReview;
          const count =
            typeof currentReview.commentsCount === "string"
              ? parseInt(currentReview.commentsCount, 10)
              : currentReview.commentsCount;
          return { ...currentReview, commentsCount: count + 1 };
        }),
      );
    });
  };

  const handleDeleteComment = (reviewId: string, commentId: string) => {
    startTransition(async () => {
      const result = await deleteCommentAction(commentId, placeId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setCommentsByReview((previous) => ({
        ...previous,
        [reviewId]: (previous[reviewId] ?? []).filter(
          (comment) => comment.id !== commentId,
        ),
      }));

      setReviews((current) =>
        current.map((currentReview) => {
          if (currentReview.id !== reviewId) return currentReview;
          const count =
            typeof currentReview.commentsCount === "string"
              ? parseInt(currentReview.commentsCount, 10)
              : currentReview.commentsCount;
          return { ...currentReview, commentsCount: Math.max(0, count - 1) };
        }),
      );
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* section header - heading */}
      <div className="flex flex-col gap-2">
        <span className="text-xl font-semibold">Avaliações da Comunidade</span>
        <Separator />
      </div>

      {/* review creation - form */}
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
          onChange={(event) => setNewContent(event.target.value)}
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

      {/* reviews - list */}
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
                  .map((part) => part[0])
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
            const reviewComments = commentsByReview[review.id] ?? [];

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
                          <Badge
                            variant="secondary"
                            className="text-[10px] py-0 px-1.5"
                          >
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
                          review.markedUsefulByMe
                            ? "fill-primary text-primary"
                            : ""
                        }`}
                      />
                      <span>Útil ({usefulCount})</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleToggleCommentsSection(review.id)}
                      className="gap-1 text-xs h-7"
                    >
                      <MessageSquareIcon className="size-3" />
                      <span>Comentários ({commentsCount})</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <ReportDialog
                      targetType="review"
                      targetId={review.id}
                      targetLabel={`Avaliação de ${author?.name ?? "Explorador"}`}
                      trigger={
                        <Button
                          variant="ghost"
                          size="xs"
                          className="gap-1 text-xs h-7 text-muted-foreground"
                        >
                          <FlagIcon className="size-3" />
                          Denunciar
                        </Button>
                      }
                    />

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
                </div>

                {/* comments - thread */}
                {activeReplyReviewId === review.id && (
                  <div className="mt-2 flex flex-col gap-3 rounded-lg bg-muted/50 p-3">
                    {loadingCommentsReviewId === review.id ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                        <Loader2Icon className="size-3.5 animate-spin" />
                        Carregando comentários...
                      </div>
                    ) : reviewComments.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {reviewComments.map((comment) => (
                          <div
                            key={comment.id}
                            className="flex items-start justify-between gap-2 rounded-md bg-background/80 p-2 text-xs"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-foreground">
                                {comment.author?.name ?? "Explorador"}
                              </span>
                              <p className="text-muted-foreground">
                                {comment.content}
                              </p>
                            </div>

                            {currentUserId &&
                              comment.author?.id === currentUserId && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-6 text-destructive"
                                  onClick={() =>
                                    handleDeleteComment(review.id, comment.id)
                                  }
                                >
                                  <Trash2Icon className="size-3" />
                                </Button>
                              )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Nenhum comentário ainda.
                      </p>
                    )}

                    <Textarea
                      placeholder="Escreva uma resposta ou comentário..."
                      value={replyContent}
                      onChange={(event) => setReplyContent(event.target.value)}
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
