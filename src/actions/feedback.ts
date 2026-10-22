"use server";

import { updateTag } from "next/cache";

import { FEEDBACK_LIST_TAG } from "@/constants/reports";
import { getApiErrorMessage } from "@/helpers/api-error";
import { createFeedback } from "@/http/feedback/feedback";
import type { FormState } from "@/types/form";

const REQUEST_FAILED_MESSAGE =
  "Um erro ocorreu ao enviar seu feedback. Tente novamente.";

/**
 * Sends platform feedback, bug report, or feature suggestion.
 */
export async function sendFeedbackAction(payload: {
  category: number; // 0: Bug, 1: Suggestion, 2: Compliment, 3: Other
  message: string;
  originPath?: string | null;
}): Promise<FormState> {
  if (!payload.message || !payload.message.trim()) {
    return {
      success: false,
      message: "Por favor, escreva uma mensagem para enviar o feedback.",
      errors: null,
    };
  }

  try {
    const response = await createFeedback({
      category: payload.category,
      message: payload.message,
      originPath: payload.originPath ?? null,
    });

    if (response.status !== 201) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(FEEDBACK_LIST_TAG);

    return {
      success: true,
      message: "Obrigado pelo seu feedback! Ele nos ajuda a melhorar o Soromaps.",
      errors: null,
    };
  } catch (error) {
    console.error("sendFeedbackAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}
