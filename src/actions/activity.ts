"use server";

import { updateTag } from "next/cache";

import {
  MY_FAVORITES_TAG,
  MY_STATS_TAG,
  MY_VERIFICATION_TAG,
  MY_VISITS_TAG,
} from "@/constants/achievements";
import { placeShowTag } from "@/constants/places";
import { getApiErrorMessage } from "@/helpers/api-error";
import {
  addFavoritePlace,
  checkInVisit,
  removeFavoritePlace,
} from "@/http/activity/activity";
import type { FormState } from "@/types/form";

const REQUEST_FAILED_MESSAGE =
  "Um erro ocorreu ao processar a atividade. Tente novamente.";

/**
 * Checks in a visit for the authenticated explorer using client coordinates.
 */
export async function checkInVisitAction(
  placeId: string,
  latitude: number,
  longitude: number,
): Promise<FormState> {
  try {
    const response = await checkInVisit(placeId, {
      latitude,
      longitude,
    });

    if (response.status !== 201) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(MY_VISITS_TAG);
    updateTag(MY_STATS_TAG);
    updateTag(MY_VERIFICATION_TAG);
    updateTag(placeShowTag(placeId));

    return {
      success: true,
      message: "Check-in realizado com sucesso!",
      errors: null,
    };
  } catch (error) {
    console.error("checkInVisitAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Adds or removes a place from the explorer's saved collection.
 */
export async function toggleFavoritePlaceAction(
  placeId: string,
  isFavorite: boolean,
): Promise<FormState> {
  try {
    const response = isFavorite
      ? await removeFavoritePlace(placeId)
      : await addFavoritePlace(placeId);

    if (response.status !== 204) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(MY_FAVORITES_TAG);
    updateTag(MY_STATS_TAG);
    updateTag(placeShowTag(placeId));

    return {
      success: true,
      message: isFavorite ? "Removido dos favoritos." : "Salvo nos favoritos!",
      errors: null,
    };
  } catch (error) {
    console.error("toggleFavoritePlaceAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}
