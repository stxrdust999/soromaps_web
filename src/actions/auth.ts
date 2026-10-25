"use server";

import { login, logout, logoutAll } from "@/http/auth/auth";
import { registerUser } from "@/http/users/users";
import { getApiErrorMessage } from "@/helpers/api-error";
import { clearAuthCookies, getRefreshToken, setAuthCookies } from "@/lib/session";
import type { FormState } from "@/types/form";
import { type LoginSchema, type RegisterSchema, loginSchema, registerSchema } from "@/validations/auth";

/**
 * Authenticates user credentials and establishes a session via httpOnly cookies.
 */
export async function loginAction(data: LoginSchema): Promise<FormState> {
  const validation = loginSchema.safeParse(data);
  if (!validation.success)
    return {
      success: false,
      message: "Algo de errado aconteceu, por favor tente novamente.",
      errors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };

  try {
    const response = await login({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, "Credenciais inválidas."),
        errors: null,
      };
    }

    await setAuthCookies(response.data);

    return {
      success: true,
      message: "Login realizado com sucesso.",
      errors: null,
    };
  } catch (error) {
    console.error("loginAction error:", error);
    return {
      success: false,
      message: "Um erro ocorreu, por favor tente novamente em alguns minutos.",
      errors: null,
    };
  }
}

/**
 * Registers a new explorer account and automatically signs in.
 */
export async function registerAction(data: RegisterSchema): Promise<FormState> {
  const validation = registerSchema.safeParse(data);
  if (!validation.success)
    return {
      success: false,
      message: "Algo de errado aconteceu, por favor tente novamente.",
      errors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };

  try {
    const registerResponse = await registerUser({
      name: validation.data.name,
      email: validation.data.email,
      password: validation.data.password,
    });

    if (registerResponse.status !== 201) {
      return {
        success: false,
        message: getApiErrorMessage(registerResponse.data, "Erro ao registrar usuário."),
        errors: null,
      };
    }

    const loginResponse = await login({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (loginResponse.status === 200)
      await setAuthCookies(loginResponse.data);

    return {
      success: true,
      message: "Usuário cadastrado com sucesso.",
      errors: null,
    };
  } catch (error) {
    console.error("registerAction error:", error);
    return {
      success: false,
      message: "Um erro ocorreu, por favor tente novamente em alguns minutos.",
      errors: null,
    };
  }
}

/**
 * Revokes current device session in the API and clears local cookies.
 */
export async function logoutAction(): Promise<void> {
  try {
    const refreshToken = await getRefreshToken();
    if (refreshToken)
      await logout({ refreshToken });
  } catch (error) {
    console.error("logoutAction error:", error);
  } finally {
    await clearAuthCookies();
  }
}

/**
 * Revokes all active sessions for the user across all devices.
 */
export async function logoutAllAction(): Promise<void> {
  try {
    await logoutAll();
  } catch (error) {
    console.error("logoutAllAction error:", error);
  } finally {
    await clearAuthCookies();
  }
}
