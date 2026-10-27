"use server";

import { updateTag } from "next/cache";

import { CURRENT_USER_TAG, USERS_LIST_TAG, userShowTag } from "@/constants/users";
import { getApiErrorMessage } from "@/helpers/api-error";
import {
  adminDeleteUser,
  adminUpdateUser,
  deleteCurrentUser,
  registerUser,
  updateCurrentUser,
} from "@/http/users/users";
import { clearAuthCookies } from "@/lib/session";
import { http, type HttpResponse } from "@/lib/client";
import type { FormState } from "@/types/form";
import {
  type ChangeEmailSchema,
  type ChangePasswordSchema,
  type CreateUserSchema,
  type UpdateUserSchema,
  changeEmailSchema,
  changePasswordSchema,
  createUserSchema,
  updateUserSchema,
} from "@/validations/users";

const INVALID_PAYLOAD_MESSAGE =
  "Algo de errado aconteceu, por favor tente novamente.";
const REQUEST_FAILED_MESSAGE =
  "Um erro ocorreu, por favor tente novamente em alguns minutos.";

/**
 * Creates a user account from administrative panel and invalidates cached user lists.
 */
export async function createUserAction(data: FormData): Promise<FormState> {
  const result = createUserSchema.safeParse(Object.fromEntries(data));

  if (!result.success) {
    return {
      success: false,
      message: INVALID_PAYLOAD_MESSAGE,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const response = await registerUser({
      name: result.data.name,
      email: result.data.email,
      password: result.data.password,
    });

    if (response.status !== 201) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(USERS_LIST_TAG);
  } catch (error) {
    console.error("createUserAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }

  return {
    success: true,
    message: "Usuário criado com sucesso.",
    errors: null,
  };
}

/**
 * Updates an existing user account from administrative modal and invalidates specific cache tags.
 */
export async function updateUserAction(
  data: FormData,
  id?: string,
): Promise<FormState> {
  const result = updateUserSchema.safeParse(Object.fromEntries(data));

  if (!result.success) {
    return {
      success: false,
      message: INVALID_PAYLOAD_MESSAGE,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (!id) {
    return {
      success: false,
      message: "ID de usuário inválido.",
      errors: null,
    };
  }

  try {
    const roleValue =
      result.data.role === "admin"
        ? 1
        : result.data.role === "explorer"
          ? 0
          : null;

    const response = await adminUpdateUser(id, {
      name: result.data.name ?? null,
      email: result.data.email ?? null,
      role: roleValue,
      neighborhood: result.data.neighborhood ?? null,
      password: result.data.password ?? null,
      avatarUrl: null,
      biography: null,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(USERS_LIST_TAG);
    updateTag(userShowTag(id));
  } catch (error) {
    console.error("updateUserAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }

  return {
    success: true,
    message: "Usuário atualizado com sucesso.",
    errors: null,
  };
}

/**
 * Deletes a user by ID with last-admin conflict handling.
 */
export async function deleteUserAction(id: string): Promise<FormState> {
  try {
    const response = await adminDeleteUser(id);

    if (response.status !== 204) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(USERS_LIST_TAG);
    updateTag(userShowTag(id));
  } catch (error) {
    console.error("deleteUserAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }

  return {
    success: true,
    message: "Usuário excluído com sucesso.",
    errors: null,
  };
}

/**
 * Updates profile details of the currently authenticated user.
 */
export async function updateCurrentUserAction(data: FormData): Promise<FormState> {
  const name = String(data.get("name") ?? "").trim();
  const neighborhood = String(data.get("neighborhood") ?? "").trim();
  const biography = String(data.get("biography") ?? "").trim();
  const avatarUrl = String(data.get("avatarUrl") ?? "").trim();

  if (!name) {
    return {
      success: false,
      message: "O nome é obrigatório.",
      errors: null,
    };
  }

  try {
    const response = await updateCurrentUser({
      name,
      neighborhood: neighborhood || null,
      biography: biography || null,
      avatarUrl: avatarUrl || null,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(CURRENT_USER_TAG);
  } catch (error) {
    console.error("updateCurrentUserAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }

  return {
    success: true,
    message: "Perfil atualizado com sucesso.",
    errors: null,
  };
}

/**
 * Deletes the currently authenticated account and clears session cookies.
 */
export async function deleteCurrentUserAction(): Promise<FormState> {
  try {
    const response = await deleteCurrentUser();

    if (response.status !== 204) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    await clearAuthCookies();
  } catch (error) {
    console.error("deleteCurrentUserAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }

  return {
    success: true,
    message: "Conta excluída com sucesso.",
    errors: null,
  };
}

/**
 * Changes authenticated user password after verifying current credentials.
 */
export async function changePasswordAction(
  data: ChangePasswordSchema,
): Promise<FormState> {
  const result = changePasswordSchema.safeParse(data);

  if (!result.success)
    return {
      success: false,
      message: INVALID_PAYLOAD_MESSAGE,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };

  try {
    const response = await http<HttpResponse<void>>(
      "/api/users/me/change-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
      },
    );

    if (response.status !== 204)
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };

    return {
      success: true,
      message: "Senha alterada com sucesso.",
      errors: null,
    };
  } catch (error) {
    console.error("changePasswordAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Updates authenticated user email address after confirming current password.
 */
export async function changeEmailAction(
  data: ChangeEmailSchema,
): Promise<FormState> {
  const result = changeEmailSchema.safeParse(data);

  if (!result.success)
    return {
      success: false,
      message: INVALID_PAYLOAD_MESSAGE,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };

  try {
    const response = await http<HttpResponse<unknown>>(
      "/api/users/me/email",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
      },
    );

    if (response.status !== 200)
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };

    updateTag(CURRENT_USER_TAG);

    return {
      success: true,
      message: "E-mail atualizado com sucesso.",
      errors: null,
    };
  } catch (error) {
    console.error("changeEmailAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}
