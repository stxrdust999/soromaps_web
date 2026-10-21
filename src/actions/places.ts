"use server";

import { updateTag } from "next/cache";

import { PLACES_LIST_TAG, placeShowTag } from "@/constants/places";
import { getApiErrorMessage } from "@/helpers/api-error";
import {
  addPlacePhoto,
  createPlace,
  createPlacePhotoUploadUrl,
  deletePlace,
  deletePlacePhoto,
  setPlaceCoverPhoto,
  updatePlace,
} from "@/http/places/places";
import type { FormState } from "@/types/form";

const INVALID_PAYLOAD_MESSAGE =
  "Algo de errado aconteceu, por favor tente novamente.";
const REQUEST_FAILED_MESSAGE =
  "Um erro ocorreu, por favor tente novamente em alguns minutos.";

/**
 * Creates a place submission (starts with 'Pending' status) and updates place tags.
 */
export async function createPlaceAction(data: {
  categoryId: string;
  name: string;
  latitude: number;
  longitude: number;
  neighborhood: string;
  about: string;
  description: string;
  hasWifi: boolean;
  isPetFriendly: boolean;
  bestTime?: string | null;
  localSecret?: string | null;
  tagIds?: string[] | null;
}): Promise<FormState & { placeId?: string }> {
  try {
    const response = await createPlace({
      categoryId: data.categoryId,
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
      neighborhood: data.neighborhood,
      about: data.about,
      description: data.description,
      hasWifi: data.hasWifi,
      isPetFriendly: data.isPetFriendly,
      bestTime: data.bestTime ?? null,
      localSecret: data.localSecret ?? null,
      tagIds: data.tagIds ?? null,
    });

    if (response.status !== 201) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(PLACES_LIST_TAG);
    return {
      success: true,
      message: "Sugestão de local enviada para moderação!",
      errors: null,
      placeId: response.data.id,
    };
  } catch (error) {
    console.error("createPlaceAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Updates an existing place's details.
 */
export async function updatePlaceAction(
  id: string,
  data: {
    categoryId?: string | null;
    name?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    neighborhood?: string | null;
    about?: string | null;
    description?: string | null;
    hasWifi?: boolean | null;
    isPetFriendly?: boolean | null;
    bestTime?: string | null;
    localSecret?: string | null;
    tagIds?: string[] | null;
  },
): Promise<FormState> {
  try {
    const response = await updatePlace(id, data);

    if (response.status !== 200) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(PLACES_LIST_TAG);
    updateTag(placeShowTag(id));
    return {
      success: true,
      message: "Local atualizado com sucesso.",
      errors: null,
    };
  } catch (error) {
    console.error("updatePlaceAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Deletes a place by ID.
 */
export async function deletePlaceAction(id: string): Promise<FormState> {
  try {
    const response = await deletePlace(id);

    if (response.status !== 204) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(PLACES_LIST_TAG);
    return {
      success: true,
      message: "Local excluído com sucesso.",
      errors: null,
    };
  } catch (error) {
    console.error("deletePlaceAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Requests a signed upload URL to store a photo in Supabase Storage.
 */
export async function createPlacePhotoUploadUrlAction(
  placeId: string,
  fileExtension?: string,
) {
  try {
    const response = await createPlacePhotoUploadUrl(placeId, {
      fileExtension: fileExtension ?? null,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        data: null,
      };
    }

    return {
      success: true,
      message: "URL gerada com sucesso.",
      data: response.data,
    };
  } catch (error) {
    console.error("createPlacePhotoUploadUrlAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      data: null,
    };
  }
}

/**
 * Registers an uploaded photo record for a place.
 */
export async function confirmPlacePhotoAction(
  placeId: string,
  url: string,
  storagePath?: string,
  isCover = false,
): Promise<FormState> {
  try {
    const response = await addPlacePhoto(placeId, {
      url,
      storagePath: storagePath ?? null,
      isCover,
    });

    if (response.status !== 201) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(placeShowTag(placeId));
    return {
      success: true,
      message: "Foto adicionada ao local.",
      errors: null,
    };
  } catch (error) {
    console.error("confirmPlacePhotoAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Sets an existing photo as the primary cover of a place.
 */
export async function setPlaceCoverPhotoAction(
  placeId: string,
  photoId: string,
): Promise<FormState> {
  try {
    const response = await setPlaceCoverPhoto(placeId, photoId);

    if (response.status !== 200) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(placeShowTag(placeId));
    return {
      success: true,
      message: "Capa do local atualizada.",
      errors: null,
    };
  } catch (error) {
    console.error("setPlaceCoverPhotoAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Deletes a photo from a place.
 */
export async function deletePlacePhotoAction(
  placeId: string,
  photoId: string,
): Promise<FormState> {
  try {
    const response = await deletePlacePhoto(placeId, photoId);

    if (response.status !== 204) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(placeShowTag(placeId));
    return {
      success: true,
      message: "Foto removida com sucesso.",
      errors: null,
    };
  } catch (error) {
    console.error("deletePlacePhotoAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}
