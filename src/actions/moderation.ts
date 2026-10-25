"use server";

import { updateTag } from "next/cache";

import {
  MODERATION_HISTORY_TAG,
  MODERATION_QUEUE_TAG,
  PLACES_LIST_TAG,
  placeShowTag,
} from "@/constants/places";
import { getApiErrorMessage } from "@/helpers/api-error";
import {
  batchDecidePlaceModeration,
  decidePlaceModeration,
  undoPlaceModerationDecision,
} from "@/http/moderation/moderation";
import type { FormState } from "@/types/form";

const REQUEST_FAILED_MESSAGE =
  "Um erro ocorreu ao processar a moderação. Tente novamente.";

/**
 * Registers an administrative decision (approve, return, reject) for a place in queue.
 */
export async function decidePlaceModerationAction(
  placeId: string,
  decision: number,
  reason?: string | null,
  feedbackNote?: string | null,
): Promise<FormState> {
  try {
    const response = await decidePlaceModeration(placeId, {
      decision,
      reason: reason ?? null,
      feedbackNote: feedbackNote ?? null,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(MODERATION_QUEUE_TAG);
    updateTag(MODERATION_HISTORY_TAG);
    updateTag(PLACES_LIST_TAG);
    updateTag(placeShowTag(placeId));

    return {
      success: true,
      message: "Decisão de moderação registrada.",
      errors: null,
    };
  } catch (error) {
    console.error("decidePlaceModerationAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Applies a batch moderation decision to multiple places simultaneously.
 */
export async function batchDecideModerationAction(
  placeIds: string[],
  decision: number,
  reason?: string | null,
  feedbackNote?: string | null,
): Promise<FormState> {
  try {
    const response = await batchDecidePlaceModeration({
      placeIds,
      decision,
      reason: reason ?? null,
      feedbackNote: feedbackNote ?? null,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(MODERATION_QUEUE_TAG);
    updateTag(MODERATION_HISTORY_TAG);
    updateTag(PLACES_LIST_TAG);
    placeIds.forEach((id) => updateTag(placeShowTag(id)));

    return {
      success: true,
      message: `${placeIds.length} locais moderados com sucesso.`,
      errors: null,
    };
  } catch (error) {
    console.error("batchDecideModerationAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Reverts the latest moderation decision for a place if performed within 24 hours.
 */
export async function undoModerationDecisionAction(
  placeId: string,
): Promise<FormState> {
  try {
    const response = await undoPlaceModerationDecision(placeId);

    if (response.status !== 200) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(MODERATION_QUEUE_TAG);
    updateTag(MODERATION_HISTORY_TAG);
    updateTag(PLACES_LIST_TAG);
    updateTag(placeShowTag(placeId));

    return {
      success: true,
      message: "Decisão revertida com sucesso.",
      errors: null,
    };
  } catch (error) {
    console.error("undoModerationDecisionAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}
