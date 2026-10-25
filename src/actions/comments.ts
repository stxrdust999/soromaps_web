"use server";

import { updateTag } from "next/cache";

import { placeReviewsTag } from "@/constants/places";
import { getApiErrorMessage } from "@/helpers/api-error";
import {
  createComment,
  deleteComment,
  listCommentsByReview,
  updateComment,
} from "@/http/comments/comments";
import type { CommentResponseDto } from "@/http/api.schemas";
import type { FormState } from "@/types/form";

const INVALID_PAYLOAD_MESSAGE =
  "Algo de errado aconteceu, por favor tente novamente.";
const REQUEST_FAILED_MESSAGE =
  "Um erro ocorreu, por favor tente novamente em alguns minutos.";

/**
 * Fetches paginated comments for a given review.
 */
export async function listReviewCommentsAction(
  reviewId: string,
): Promise<CommentResponseDto[]> {
  try {
    const response = await listCommentsByReview(reviewId, {
      Page: 1,
      PageSize: 50,
    });

    if (response.status === 200 && response.data.items)
      return response.data.items;

    return [];
  } catch (error) {
    console.error("listReviewCommentsAction error:", error);
    return [];
  }
}

/**
 * Creates a comment or reply on a review.
 */
export async function createCommentAction(
  reviewId: string,
  placeId: string,
  content: string,
  replyToId?: string | null,
): Promise<FormState & { commentId?: string }> {
  if (!content.trim()) {
    return {
      success: false,
      message: INVALID_PAYLOAD_MESSAGE,
      errors: null,
    };
  }

  try {
    const response = await createComment({
      reviewId,
      content,
      replyToId: replyToId ?? null,
    });

    if (response.status !== 201) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(placeReviewsTag(placeId));

    return {
      success: true,
      message: "Comentário publicado.",
      errors: null,
      commentId: response.data.id,
    };
  } catch (error) {
    console.error("createCommentAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Updates an existing comment.
 */
export async function updateCommentAction(
  id: string,
  placeId: string,
  content: string,
): Promise<FormState> {
  if (!content.trim()) {
    return {
      success: false,
      message: INVALID_PAYLOAD_MESSAGE,
      errors: null,
    };
  }

  try {
    const response = await updateComment(id, { content });

    if (response.status !== 200) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(placeReviewsTag(placeId));

    return {
      success: true,
      message: "Comentário atualizado.",
      errors: null,
    };
  } catch (error) {
    console.error("updateCommentAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Deletes a comment.
 */
export async function deleteCommentAction(
  id: string,
  placeId: string,
): Promise<FormState> {
  try {
    const response = await deleteComment(id);

    if (response.status !== 204) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(placeReviewsTag(placeId));

    return {
      success: true,
      message: "Comentário removido.",
      errors: null,
    };
  } catch (error) {
    console.error("deleteCommentAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}
