"use server";

import { updateTag } from "next/cache";

import { FEED_LIST_TAG, FEED_MUTES_TAG } from "@/constants/reports";
import { getApiErrorMessage } from "@/helpers/api-error";
import { addFeedMute, removeFeedMute } from "@/http/feed/feed";
import type { FormState } from "@/types/form";

const REQUEST_FAILED_MESSAGE =
  "Um erro ocorreu ao atualizar o silenciamento do feed. Tente novamente.";

/**
 * Creates a mute scope on the activity feed (e.g., category or neighborhood).
 */
export async function createFeedMuteAction(payload: {
  scopeType: number; // 0: Neighborhood, 1: Category, 2: ItemKind
  scopeValue: string;
}): Promise<FormState & { muteId?: string }> {
  if (!payload.scopeValue) {
    return {
      success: false,
      message: "Escopo de silenciamento inválido.",
      errors: null,
    };
  }

  try {
    const response = await addFeedMute({
      scopeType: payload.scopeType,
      scopeValue: payload.scopeValue,
    });

    if (response.status !== 201) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(FEED_MUTES_TAG);
    updateTag(FEED_LIST_TAG);

    return {
      success: true,
      message: "Você verá menos conteúdo deste escopo no feed.",
      errors: null,
      muteId: response.data.id,
    };
  } catch (error) {
    console.error("createFeedMuteAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Removes an existing feed mute scope.
 */
export async function deleteFeedMuteAction(muteId: string): Promise<FormState> {
  try {
    const response = await removeFeedMute(muteId);

    if (response.status !== 204) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(FEED_MUTES_TAG);
    updateTag(FEED_LIST_TAG);

    return {
      success: true,
      message: "Silenciamento removido.",
      errors: null,
    };
  } catch (error) {
    console.error("deleteFeedMuteAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}
