"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";

import { dismissReportsAction } from "@/actions/reports";
import { removeContentAction } from "@/actions/reviews";
import type { listAdminFeedbackResponse } from "@/http/feedback/feedback";
import type { listAdminGroupedReportsResponse } from "@/http/reports/reports";
import type {
  FeedbackKind,
  FeedbackMock,
  FeedbackStatus,
  ReportCaseMock,
  ReportReason,
  ReportTargetKind,
} from "@/types/reports";

/**
 * Abaixo disto a conta é recém-criada. Três dias cobre a janela em que uma
 * brigada organizada abre contas para reportar o mesmo alvo.
 */
const NEW_ACCOUNT_DAYS = 3;

/** Mínimo de denunciantes para o padrão coordenado ser afirmável. */
const COORDINATED_MINIMUM = 3;

export type ReportSignalKind = "coordenada" | "reincidente" | "divergente";

export interface ReportSignal {
  kind: ReportSignalKind;
  label: string;
  /** `bad` invalida a denúncia; `warn` pesa na decisão; `neutral` é contexto. */
  tone: "bad" | "warn" | "neutral";
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function daysSince(isoDate: string): number {
  const timestamp = new Date(isoDate).getTime();
  if (Number.isNaN(timestamp)) return 0;
  return Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
}

function normalizeReason(rawReason: string): ReportReason {
  const normalized = rawReason.trim().toLowerCase();
  if (normalized.includes("spam")) return "spam";
  if (normalized.includes("ofens") || normalized.includes("odio"))
    return "ofensa";
  if (normalized.includes("fals") || normalized.includes("fake"))
    return "falsa";
  if (normalized.includes("escop") || normalized.includes("fora"))
    return "escopo";
  return "improprio";
}

/**
 * Sinais de risco do caso agrupado por alvo.
 */
export function getReportSignals(report: ReportCaseMock): ReportSignal[] {
  const signals: ReportSignal[] = [];

  const newAccounts = report.denunciantes.filter(
    (reporter) =>
      reporter.diasDeConta !== undefined &&
      reporter.diasDeConta <= NEW_ACCOUNT_DAYS,
  ).length;

  if (
    newAccounts >= COORDINATED_MINIMUM &&
    newAccounts === report.denunciantes.length
  ) {
    signals.push({
      kind: "coordenada",
      label: "Possível denúncia coordenada",
      tone: "bad",
    });
  }

  if (report.autor.conteudoRemovido > 0) {
    signals.push({
      kind: "reincidente",
      label: "Autor reincidente",
      tone: "warn",
    });
  }

  const reasons = new Set(
    report.denunciantes.map((reporter) => reporter.motivo),
  );
  if (reasons.size > 1) {
    signals.push({
      kind: "divergente",
      label: "Motivos divergentes",
      tone: "neutral",
    });
  }

  return signals;
}

export interface ReasonTally {
  motivo: ReportReason;
  total: number;
  /** Fração do total, em percentual — largura da barra. */
  fracao: number;
}

/**
 * Motivos somados, do mais citado ao menos.
 */
export function tallyReasons(report: ReportCaseMock): ReasonTally[] {
  const counts = new Map<ReportReason, number>();

  for (const reporter of report.denunciantes) {
    counts.set(reporter.motivo, (counts.get(reporter.motivo) ?? 0) + 1);
  }

  const total = Math.max(report.denunciantes.length, 1);

  return [...counts.entries()]
    .sort(([, first], [, second]) => second - first)
    .map(([motivo, count]) => ({
      motivo,
      total: count,
      fracao: Math.round((count / total) * 100),
    }));
}

/** Conta recém-criada — o dado que revela coordenação. */
export function isNewAccount(diasDeConta?: number): boolean {
  return diasDeConta !== undefined && diasDeConta <= NEW_ACCOUNT_DAYS;
}

interface QueueFilters {
  texto: string;
  alvoTipo: string;
  motivo: string;
  sinal: string;
}

const EMPTY_FILTERS: QueueFilters = {
  texto: "",
  alvoTipo: "",
  motivo: "",
  sinal: "",
};

function matchesFilters(report: ReportCaseMock, filters: QueueFilters) {
  if (filters.texto) {
    const haystack =
      `${report.trecho} ${report.alvoNome ?? ""} ${report.conteudo.local ?? ""}`.toLowerCase();
    if (!haystack.includes(filters.texto.toLowerCase())) return false;
  }

  if (filters.alvoTipo && report.alvoTipo !== filters.alvoTipo) return false;

  if (
    filters.motivo &&
    !report.denunciantes.some((reporter) => reporter.motivo === filters.motivo)
  ) {
    return false;
  }

  if (filters.sinal) {
    const signals = getReportSignals(report);

    return filters.sinal === "nenhum"
      ? signals.length === 0
      : signals.some((signal) => signal.kind === filters.sinal);
  }

  return true;
}

interface UseReportsOptions {
  reportsPromise: Promise<listAdminGroupedReportsResponse>;
  feedbackPromise: Promise<listAdminFeedbackResponse>;
}

/**
 * Hook de estado da caixa de entrada de denúncias e feedback, desempacotando Promises via `React.use()`.
 */
export function useReports({
  reportsPromise,
  feedbackPromise,
}: UseReportsOptions) {
  const reportsResponse = use(reportsPromise);
  const feedbackResponse = use(feedbackPromise);

  const initialReports = useMemo<ReportCaseMock[]>(() => {
    const rawItems =
      reportsResponse.status === 200 ? reportsResponse.data.items : [];

    const kindMap: Record<number, ReportTargetKind> = {
      0: "ponto",
      1: "avaliacao",
      2: "comentario",
      3: "perfil",
    };

    return rawItems.map((item) => {
      const targetTypeEnum = Number(
        item.target?.targetType ?? item.targetType ?? 0,
      );
      const alvoTipo = kindMap[targetTypeEnum] ?? "ponto";
      const authorName = item.target?.author?.name ?? "Explorador";
      const totalReporters = Math.max(
        Number(item.reportersCount ?? 0),
        item.reasons.length,
        1,
      );
      const diasAberto = daysSince(item.firstReportedAt);

      const denunciantes = Array.from({ length: totalReporters }).map(
        (_, index) => {
          const reasonText =
            item.reasons[index % Math.max(item.reasons.length, 1)] ??
            "improprio";
          return {
            nome: `Denunciante ${index + 1}`,
            iniciais: `D${index + 1}`,
            motivo: normalizeReason(reasonText),
            quando: diasAberto === 0 ? "hoje" : `há ${diasAberto}d`,
            membroDesde: "membro verificado",
          };
        },
      );

      return {
        id: item.targetId,
        targetTypeEnum,
        alvoTipo,
        alvoNome: item.target?.title ?? "Conteúdo denunciado",
        autor: {
          id: item.target?.author?.id,
          nome: authorName,
          iniciais: getInitials(authorName),
          titulo: "Explorador",
          membroDesde: new Date(
            item.target?.createdAt ?? item.firstReportedAt,
          ).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
          avaliacoesEscritas: 0,
          conteudoRemovido: 0,
        },
        diasAberto,
        trecho: item.target?.content ?? item.target?.title ?? "",
        conteudo: {
          corpo: item.target?.content ?? "",
          local: item.target?.subtitle ?? item.target?.title ?? "Sorocaba",
          bairro: item.target?.subtitle ?? "Sorocaba",
          data: new Date(
            item.target?.createdAt ?? item.firstReportedAt,
          ).toLocaleDateString("pt-BR"),
        },
        denunciantes,
      };
    });
  }, [reportsResponse]);

  const initialFeedback = useMemo<FeedbackMock[]>(() => {
    const rawItems =
      feedbackResponse.status === 200 ? feedbackResponse.data.items : [];

    const kindMap: Record<number, FeedbackKind> = {
      0: "bug",
      1: "sugestao",
      2: "elogio",
    };

    return rawItems.map((item) => {
      const authorName = item.author?.name?.trim();
      return {
        id: item.id,
        tipo: kindMap[Number(item.category)] ?? "sugestao",
        mensagem: item.message,
        status: "novo" as FeedbackStatus,
        diasRecebido: daysSince(item.createdAt),
        autor: authorName
          ? {
              nome: authorName,
              iniciais: getInitials(authorName),
              titulo: "Explorador",
            }
          : undefined,
        rota: item.originPath ?? undefined,
      };
    });
  }, [feedbackResponse]);

  const [reports, setReports] = useState<ReportCaseMock[]>(initialReports);
  const [feedback, setFeedback] = useState<FeedbackMock[]>(initialFeedback);

  useEffect(() => {
    setReports(initialReports);
  }, [initialReports]);

  useEffect(() => {
    setFeedback(initialFeedback);
  }, [initialFeedback]);

  const [filters, setFilters] = useState<QueueFilters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialReports[0]?.id ?? null,
  );

  /** Mais denunciados primeiro: o caso de 6 reports pesa mais que o de 1. */
  const visible = useMemo(
    () =>
      reports
        .filter((report) => matchesFilters(report, filters))
        .sort(
          (first, second) =>
            second.denunciantes.length - first.denunciantes.length ||
            second.diasAberto - first.diasAberto,
        ),
    [reports, filters],
  );

  const selected =
    visible.find((report) => report.id === selectedId) ?? visible[0] ?? null;

  const stats = useMemo(
    () => ({
      casos: reports.length,
      coordenadas: reports.filter((report) =>
        getReportSignals(report).some((signal) => signal.kind === "coordenada"),
      ).length,
      denuncias: reports.reduce(
        (sum, report) => sum + report.denunciantes.length,
        0,
      ),
      naoLidos: feedback.filter((item) => item.status === "novo").length,
      bugs: feedback.filter((item) => item.tipo === "bug").length,
      sugestoes: feedback.filter((item) => item.tipo === "sugestao").length,
      elogios: feedback.filter((item) => item.tipo === "elogio").length,
    }),
    [reports, feedback],
  );

  const updateFilters = useCallback(
    (patch: Partial<QueueFilters>) => {
      const next = { ...filters, ...patch };
      const stillVisible = reports.filter((report) =>
        matchesFilters(report, next),
      );

      setFilters(next);
      setSelectedId(stillVisible[0]?.id ?? null);
    },
    [filters, reports],
  );

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setSelectedId(reports[0]?.id ?? null);
  }, [reports]);

  /**
   * Descarta as denúncias mantendo o conteúdo publicado.
   */
  const discardCase = useCallback(async (): Promise<ReportCaseMock | null> => {
    if (!selected) return null;

    const index = visible.findIndex((report) => report.id === selected.id);
    const remaining = visible.filter((report) => report.id !== selected.id);
    const next = remaining[Math.min(index, remaining.length - 1)];

    const targetType =
      selected.alvoTipo === "ponto"
        ? "Place"
        : selected.alvoTipo === "avaliacao"
          ? "Review"
          : "Comment";

    await dismissReportsAction(
      targetType,
      selected.id,
      "Caso descartado pelo moderador",
    );

    setReports((current) =>
      current.filter((report) => report.id !== selected.id),
    );
    setSelectedId(next?.id ?? null);

    return selected;
  }, [visible, selected]);

  /**
   * Remove o conteúdo denunciado e encerra o caso.
   */
  const removeReportedContent = useCallback(
    async (reason: string): Promise<ReportCaseMock | null> => {
      if (!selected) return null;

      const index = visible.findIndex((report) => report.id === selected.id);
      const remaining = visible.filter((report) => report.id !== selected.id);
      const next = remaining[Math.min(index, remaining.length - 1)];

      const targetType =
        selected.alvoTipo === "ponto"
          ? "Place"
          : selected.alvoTipo === "avaliacao"
            ? "Review"
            : "Comment";

      await removeContentAction(targetType, selected.id, reason);
      await dismissReportsAction(
        targetType,
        selected.id,
        `Conteúdo removido: ${reason}`,
      );

      setReports((current) =>
        current.filter((report) => report.id !== selected.id),
      );
      setSelectedId(next?.id ?? null);

      return selected;
    },
    [visible, selected],
  );

  const setFeedbackStatus = useCallback(
    (id: string, status: FeedbackStatus) => {
      setFeedback((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item)),
      );
    },
    [],
  );

  return {
    visible,
    selected,
    selectedId: selected?.id ?? null,
    setSelectedId,
    filters,
    updateFilters,
    clearFilters,
    stats,
    discardCase,
    removeReportedContent,
    feedback,
    setFeedbackStatus,
  };
}

export type { FeedbackMock, ReportCaseMock };

