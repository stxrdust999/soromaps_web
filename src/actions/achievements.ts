"use server";

import { updateTag } from "next/cache";

import {
  ACHIEVEMENTS_LIST_TAG,
  achievementShowTag,
  MY_ACHIEVEMENTS_TAG,
} from "@/constants/achievements";
import { getApiErrorMessage } from "@/helpers/api-error";
import {
  createAchievement,
  deleteAchievement,
  estimateAchievementImpact,
  updateAchievement,
} from "@/http/achievements/achievements";
import type { FormState } from "@/types/form";
import { type AchievementFormSchema, achievementFormSchema } from "@/validations/achievements";

const INVALID_PAYLOAD_MESSAGE =
  "Algo de errado aconteceu, por favor tente novamente.";
const REQUEST_FAILED_MESSAGE =
  "Um erro ocorreu ao processar a conquista. Tente novamente.";

/** Mapeamento de evento do front para o enum numérico da API */
const EVENT_TYPE_MAP: Record<string, number> = {
  visitar: 0,
  avaliar: 1,
  favoritar: 2,
  criar: 3,
  comentar: 4,
};

/** Mapeamento de tipo de alvo para o enum numérico da API */
const TARGET_TYPE_MAP: Record<string, number> = {
  categoria: 1,
  bairro: 2,
};

/**
 * Creates a new achievement in the administrative catalogue.
 */
export async function createAchievementAction(
  data: AchievementFormSchema,
): Promise<FormState & { achievementId?: string }> {
  const result = achievementFormSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      message: INVALID_PAYLOAD_MESSAGE,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const eventType = EVENT_TYPE_MAP[result.data.evento] ?? 0;
    const targetType = result.data.tipoAlvo
      ? TARGET_TYPE_MAP[result.data.tipoAlvo] ?? 0
      : 0;

    const response = await createAchievement({
      name: result.data.nome,
      description: result.data.descricao,
      icon: result.data.icone,
      color: result.data.cor,
      eventType,
      requiredQuantity: result.data.quantidade,
      targetType,
      targetValue: result.data.alvo ?? null,
      isActive: result.data.ativa,
    });

    if (response.status !== 201) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(ACHIEVEMENTS_LIST_TAG);
    updateTag(MY_ACHIEVEMENTS_TAG);

    return {
      success: true,
      message: "Conquista cadastrada com sucesso!",
      errors: null,
      achievementId: response.data.id,
    };
  } catch (error) {
    console.error("createAchievementAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Updates an achievement's criteria or presentation.
 */
export async function updateAchievementAction(
  id: string,
  data: Partial<AchievementFormSchema>,
): Promise<FormState> {
  try {
    const eventType = data.evento !== undefined ? EVENT_TYPE_MAP[data.evento] ?? 0 : null;
    const targetType =
      data.tipoAlvo !== undefined
        ? data.tipoAlvo
          ? TARGET_TYPE_MAP[data.tipoAlvo] ?? 0
          : 0
        : null;

    const response = await updateAchievement(id, {
      name: data.nome ?? null,
      description: data.descricao ?? null,
      icon: data.icone ?? null,
      color: data.cor ?? null,
      eventType,
      requiredQuantity: data.quantidade ?? null,
      targetType,
      targetValue: data.alvo ?? null,
      isActive: data.ativa ?? null,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(ACHIEVEMENTS_LIST_TAG);
    updateTag(achievementShowTag(id));
    updateTag(MY_ACHIEVEMENTS_TAG);

    return {
      success: true,
      message: "Conquista atualizada com sucesso.",
      errors: null,
    };
  } catch (error) {
    console.error("updateAchievementAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Toggles an achievement active status directly.
 */
export async function toggleAchievementActiveAction(
  id: string,
  isActive: boolean,
): Promise<FormState> {
  try {
    const response = await updateAchievement(id, { isActive });

    if (response.status !== 200) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(ACHIEVEMENTS_LIST_TAG);
    updateTag(achievementShowTag(id));
    updateTag(MY_ACHIEVEMENTS_TAG);

    return {
      success: true,
      message: isActive ? "Conquista ativada." : "Conquista desativada.",
      errors: null,
    };
  } catch (error) {
    console.error("toggleAchievementActiveAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Deletes an achievement.
 */
export async function deleteAchievementAction(id: string): Promise<FormState> {
  try {
    const response = await deleteAchievement(id);

    if (response.status !== 204) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(ACHIEVEMENTS_LIST_TAG);
    updateTag(MY_ACHIEVEMENTS_TAG);

    return {
      success: true,
      message: "Conquista excluída.",
      errors: null,
    };
  } catch (error) {
    console.error("deleteAchievementAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Estimates audience reach for proposed achievement criteria.
 */
export async function estimateAchievementAction(data: {
  evento: string;
  quantidade: number;
  tipoAlvo?: string | null;
  alvo?: string | null;
}) {
  try {
    const eventType = EVENT_TYPE_MAP[data.evento] ?? 0;
    const targetType = data.tipoAlvo ? TARGET_TYPE_MAP[data.tipoAlvo] ?? 0 : 0;

    const response = await estimateAchievementImpact({
      EventType: eventType,
      RequiredQuantity: data.quantidade,
      TargetType: targetType,
      TargetValue: data.alvo ?? undefined,
    });

    if (response.status !== 200) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("estimateAchievementAction error:", error);
    return null;
  }
}
