"use server";

import { updateTag } from "next/cache";

import { CATEGORIES_LIST_TAG, categoryShowTag } from "@/constants/categories";
import { getApiErrorMessage } from "@/helpers/api-error";
import {
  createCategory,
  deleteCategory,
  reorderCategories,
  updateCategory,
} from "@/http/categories/categories";
import type { FormState } from "@/types/form";
import { categoryFormSchema } from "@/validations/categories";

const INVALID_PAYLOAD_MESSAGE =
  "Algo de errado aconteceu, por favor tente novamente.";
const REQUEST_FAILED_MESSAGE =
  "Um erro ocorreu, por favor tente novamente em alguns minutos.";

/**
 * Creates a new category and purges the category list cache.
 */
export async function createCategoryAction(data: FormData): Promise<FormState> {
  const rawData = {
    nome: data.get("nome"),
    cor: data.get("cor"),
    icone: data.get("icone"),
    ativa: data.get("ativa") === "true" || data.get("ativa") === "on",
  };

  const result = categoryFormSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      message: INVALID_PAYLOAD_MESSAGE,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const response = await createCategory({
      name: result.data.nome,
      color: result.data.cor,
      icon: result.data.icone,
      isActive: result.data.ativa,
    });

    if (response.status !== 201) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(CATEGORIES_LIST_TAG);
    return {
      success: true,
      message: "Categoria cadastrada com sucesso.",
      errors: null,
    };
  } catch (error) {
    console.error("createCategoryAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Updates a category and purges affected cache tags.
 */
export async function updateCategoryAction(
  id: string,
  data: FormData,
): Promise<FormState> {
  const rawData = {
    nome: data.get("nome"),
    cor: data.get("cor"),
    icone: data.get("icone"),
    ativa: data.get("ativa") === "true" || data.get("ativa") === "on",
  };

  const result = categoryFormSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      message: INVALID_PAYLOAD_MESSAGE,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const response = await updateCategory(id, {
      name: result.data.nome,
      color: result.data.cor,
      icon: result.data.icone,
      isActive: result.data.ativa,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(CATEGORIES_LIST_TAG);
    updateTag(categoryShowTag(id));
    return {
      success: true,
      message: "Categoria atualizada com sucesso.",
      errors: null,
    };
  } catch (error) {
    console.error("updateCategoryAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Toggles a category active status directly without needing full payload.
 */
export async function toggleCategoryActiveAction(
  id: string,
  isActive: boolean,
): Promise<FormState> {
  try {
    const response = await updateCategory(id, {
      isActive,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(CATEGORIES_LIST_TAG);
    updateTag(categoryShowTag(id));
    return {
      success: true,
      message: "Status da categoria atualizado.",
      errors: null,
    };
  } catch (error) {
    console.error("toggleCategoryActiveAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Updates visual order sequence for all categories in a single transaction.
 */
export async function reorderCategoriesAction(
  categoryIds: string[],
): Promise<FormState> {
  try {
    const response = await reorderCategories({
      categoryIds,
    });

    if (response.status !== 204) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(CATEGORIES_LIST_TAG);
    return {
      success: true,
      message: "Ordem das categorias atualizada.",
      errors: null,
    };
  } catch (error) {
    console.error("reorderCategoriesAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Deletes a category and optionally reassigns its linked places to another category.
 */
export async function deleteCategoryAction(
  id: string,
  reassignTo?: string,
): Promise<FormState> {
  try {
    const response = await deleteCategory(id, {
      reassignTo: reassignTo || undefined,
    });

    if (response.status !== 204) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(CATEGORIES_LIST_TAG);
    return {
      success: true,
      message: "Categoria removida com sucesso.",
      errors: null,
    };
  } catch (error) {
    console.error("deleteCategoryAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}
