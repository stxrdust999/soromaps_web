"use server";

import { updateTag } from "next/cache";

import {
  ADMIN_REVIEWS_LIST_TAG,
  placeReviewsTag,
  placeShowTag,
} from "@/constants/places";
import { getApiErrorMessage } from "@/helpers/api-error";
import { adminCreateRemoval } from "@/http/admin-reviews/admin-reviews";
import {
  createReview,
  deleteReview,
  removeReviewUsefulVote,
  updateReview,
  voteReviewUseful,
} from "@/http/reviews/reviews";
import type { FormState } from "@/types/form";

const INVALID_PAYLOAD_MESSAGE =
  "Algo de errado aconteceu, por favor tente novamente.";
const REQUEST_FAILED_MESSAGE =
  "Um erro ocorreu, por favor tente novamente em alguns minutos.";

/**
 * Creates a new review for a place and invalidates place cache tags.
 */
export async function createReviewAction(
  placeId: string,
  data: { rating: number; content: string },
): Promise<FormState & { reviewId?: string }> {
  if (!data.content.trim() || data.rating < 1 || data.rating > 5) {
    return {
      success: false,
      message: INVALID_PAYLOAD_MESSAGE,
      errors: null,
    };
  }

  try {
    const response = await createReview({
      placeId,
      rating: data.rating,
      content: data.content,
    });

    if (response.status !== 201) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(placeReviewsTag(placeId));
    updateTag(placeShowTag(placeId));
    updateTag(ADMIN_REVIEWS_LIST_TAG);

    return {
      success: true,
      message: "Avaliação publicada com sucesso!",
      errors: null,
      reviewId: response.data.id,
    };
  } catch (error) {
    console.error("createReviewAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Updates an existing review written by the current user.
 */
export async function updateReviewAction(
  id: string,
  placeId: string,
  data: { rating?: number; content?: string },
): Promise<FormState> {
  try {
    const response = await updateReview(id, {
      rating: data.rating ?? null,
      content: data.content ?? null,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(placeReviewsTag(placeId));
    updateTag(placeShowTag(placeId));
    updateTag(ADMIN_REVIEWS_LIST_TAG);

    return {
      success: true,
      message: "Avaliação atualizada.",
      errors: null,
    };
  } catch (error) {
    console.error("updateReviewAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Deletes a review.
 */
export async function deleteReviewAction(
  id: string,
  placeId: string,
): Promise<FormState> {
  try {
    const response = await deleteReview(id);

    if (response.status !== 204) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(placeReviewsTag(placeId));
    updateTag(placeShowTag(placeId));
    updateTag(ADMIN_REVIEWS_LIST_TAG);

    return {
      success: true,
      message: "Avaliação removida.",
      errors: null,
    };
  } catch (error) {
    console.error("deleteReviewAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Toggles a useful vote on a review.
 */
export async function toggleReviewUsefulVoteAction(
  id: string,
  placeId: string,
  currentlyUseful: boolean,
): Promise<FormState> {
  try {
    const response = currentlyUseful
      ? await removeReviewUsefulVote(id)
      : await voteReviewUseful(id);

    if (response.status !== 204) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(placeReviewsTag(placeId));
    updateTag(ADMIN_REVIEWS_LIST_TAG);

    return {
      success: true,
      message: currentlyUseful ? "Voto removido." : "Marcado como útil.",
      errors: null,
    };
  } catch (error) {
    console.error("toggleReviewUsefulVoteAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Records an audited administrative removal for content (review, comment, place).
 */
export async function removeContentAction(
  targetType: string,
  targetId: string,
  reason: string,
  note?: string | null,
  placeId?: string,
): Promise<FormState> {
  try {
    const response = await adminCreateRemoval({
      targetType,
      targetId,
      reason,
      note: note ?? null,
    });

    if (response.status !== 201) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(ADMIN_REVIEWS_LIST_TAG);
    if (placeId) {
      updateTag(placeReviewsTag(placeId));
      updateTag(placeShowTag(placeId));
    }

    return {
      success: true,
      message: "Conteúdo removido com sucesso.",
      errors: null,
    };
  } catch (error) {
    console.error("removeContentAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}
