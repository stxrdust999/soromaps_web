import { API_ERROR_MESSAGES } from "@/constants/api-errors";

interface ProblemDetailsLike {
  code?: string;
  detail?: string;
  title?: string;
  errors?: Record<string, string[]>;
  extensions?: {
    code?: string;
  };
}

/**
 * Extracts friendly localized error messages from API ProblemDetails payloads.
 * Evaluates domain error codes first, followed by validation field dictionaries and fallback descriptions.
 */
export function getApiErrorMessage(
  errorPayload: unknown,
  fallbackMessage = "Um erro ocorreu, por favor tente novamente em alguns minutos.",
): string {
  if (!errorPayload || typeof errorPayload !== "object")
    return fallbackMessage;

  const problem = errorPayload as ProblemDetailsLike;
  const errorCode = problem.code ?? problem.extensions?.code;

  if (errorCode && API_ERROR_MESSAGES[errorCode])
    return API_ERROR_MESSAGES[errorCode];

  if (problem.errors && typeof problem.errors === "object") {
    const errorKeys = Object.keys(problem.errors);
    if (errorKeys.length > 0) {
      const firstKeyErrors = problem.errors[errorKeys[0]];
      if (Array.isArray(firstKeyErrors) && firstKeyErrors.length > 0) {
        const firstMessage = firstKeyErrors[0];
        if (API_ERROR_MESSAGES[firstMessage])
          return API_ERROR_MESSAGES[firstMessage];
        return firstMessage;
      }
    }
  }

  if (problem.detail && typeof problem.detail === "string") {
    if (API_ERROR_MESSAGES[problem.detail])
      return API_ERROR_MESSAGES[problem.detail];
    return problem.detail;
  }

  return fallbackMessage;
}
