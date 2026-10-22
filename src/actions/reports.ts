"use server";

import { updateTag } from "next/cache";

import { REPORTS_LIST_TAG } from "@/constants/reports";
import { getApiErrorMessage } from "@/helpers/api-error";
import { createReport, dismissAdminReports } from "@/http/reports/reports";
import type { FormState } from "@/types/form";

const REQUEST_FAILED_MESSAGE =
  "Um erro ocorreu ao processar a denúncia. Tente novamente.";

/**
 * Creates a moderation report for a place, review, or comment.
 */
export async function createReportAction(payload: {
  targetType: number; // 0: Place, 1: Review, 2: Comment
  targetId: string;
  reason: string;
  details?: string | null;
}): Promise<FormState> {
  if (!payload.targetId || !payload.reason.trim()) {
    return {
      success: false,
      message: "Dados de denúncia incompletos.",
      errors: null,
    };
  }

  try {
    const response = await createReport({
      targetType: payload.targetType,
      targetId: payload.targetId,
      reason: payload.reason,
      details: payload.details ?? null,
    });

    if (response.status !== 204) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(REPORTS_LIST_TAG);

    return {
      success: true,
      message: "Denúncia enviada com sucesso para a moderação.",
      errors: null,
    };
  } catch (error) {
    console.error("createReportAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Dismisses all open reports on a specific target without removing the content.
 */
export async function dismissReportsAction(
  targetType: string,
  targetId: string,
  resolutionNote?: string | null,
): Promise<FormState> {
  try {
    const response = await dismissAdminReports(targetType, targetId, {
      resolutionNote: resolutionNote ?? null,
    });

    if (response.status !== 204) {
      return {
        success: false,
        message: getApiErrorMessage(response.data, REQUEST_FAILED_MESSAGE),
        errors: null,
      };
    }

    updateTag(REPORTS_LIST_TAG);

    return {
      success: true,
      message: "Denúncias arquivadas com sucesso.",
      errors: null,
    };
  } catch (error) {
    console.error("dismissReportsAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}
