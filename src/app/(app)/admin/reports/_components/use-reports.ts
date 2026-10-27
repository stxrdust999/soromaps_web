"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";

import { dismissReportsAction } from "@/actions/reports";
import { removeContentAction } from "@/actions/reviews";
import type {
  AdminGroupedReportItemDto,
  ReportTargetSnapshotDto,
} from "@/http/api.schemas";
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

/**
 * Denunciante individual enriquecido retornado pelo endpoint de denúncias agrupadas.
 */
export interface EnrichedReportReporterDto {
  name: string;
  initials: string;
  reason: string;
  createdAt: string;
  memberSince: string;
  accountAgeDays: number;
}

/**
 * Snapshot enriquecido do alvo denunciado com histórico do autor e metadados do conteúdo.
 */
export interface EnrichedReportTargetSnapshotDto
  extends Omit<ReportTargetSnapshotDto, "targetType"> {
  targetType?:
    | ReportTargetSnapshotDto["targetType"]
    | "place"
    | "review"
    | "comment";
  authorTitle?: string | null;
  authorMemberSince?: string | null;
  authorReviewsCount?: number;
  authorRemovedContentCount?: number;
  placeName?: string | null;
  neighborhood?: string | null;
  categoryName?: string | null;
  coordinates?: string | null;
  rating?: number | null;
  parentReviewContent?: string | null;
}

/**
 * Item agrupado de denúncias enriquecido com denunciantes reais e suporte a enums como string ou número.
 */
export interface EnrichedAdminGroupedReportItemDto
  extends Omit<AdminGroupedReportItemDto, "target" | "targetType"> {
  targetType?:
    | AdminGroupedReportItemDto["targetType"]
    | "place"
    | "review"
    | "comment";
  status?: number | "pending" | "resolved" | "dismissed";
  target?: EnrichedReportTargetSnapshotDto | null;
  reporters?: EnrichedReportReporterDto[] | null;
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

function formatarDataCurta(dateValue: string): string {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return dateValue;

  return parsedDate.toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });
}

function formatarDataRelativa(isoDate: string): string {
  const elapsedDays = daysSince(isoDate);
  if (elapsedDays <= 0) return "hoje";
  return `há ${elapsedDays}d`;
}

/**
 * Normaliza o motivo textual ou código da API para a taxonomia visual de motivos de denúncia.
 */
export function mapReasonString(rawReason: string): ReportReason {
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

function resolveTargetKind(
  rawTargetType:
    | EnrichedAdminGroupedReportItemDto["targetType"]
    | string
    | null
    | undefined,
): { targetTypeEnum: number; alvoTipo: ReportTargetKind } {
  if (rawTargetType === 1 || rawTargetType === "review")
    return { targetTypeEnum: 1, alvoTipo: "avaliacao" };
  if (rawTargetType === 2 || rawTargetType === "comment")
    return { targetTypeEnum: 2, alvoTipo: "comentario" };
  if (rawTargetType === 3 || rawTargetType === "profile")
    return { targetTypeEnum: 3, alvoTipo: "perfil" };
  if (rawTargetType === 0 || rawTargetType === "place")
    return { targetTypeEnum: 0, alvoTipo: "ponto" };

  if (typeof rawTargetType === "string") {
    const normalized = rawTargetType.trim().toLowerCase();
    if (normalized === "review" || normalized === "1")
      return { targetTypeEnum: 1, alvoTipo: "avaliacao" };
    if (normalized === "comment" || normalized === "2")
      return { targetTypeEnum: 2, alvoTipo: "comentario" };
    if (normalized === "profile" || normalized === "3")
      return { targetTypeEnum: 3, alvoTipo: "perfil" };
  }

  return { targetTypeEnum: 0, alvoTipo: "ponto" };
}

function resolveReportStatus(
  rawStatus: EnrichedAdminGroupedReportItemDto["status"] | string | undefined,
): "pendente" | "removido" | "mantido" {
  if (rawStatus === 1 || rawStatus === "resolved") return "removido";
  if (rawStatus === 2 || rawStatus === "dismissed") return "mantido";
  return "pendente";
}

/**
 * Converte um item agrupado da API para o modelo de visualização da fila e do painel de detalhes.
 */
export function mapApiReportToLocal(
  item: EnrichedAdminGroupedReportItemDto,
): ReportCaseMock {
  const target = item.target;
  const { targetTypeEnum, alvoTipo } = resolveTargetKind(
    target?.targetType ?? item.targetType,
  );
  resolveReportStatus(item.status);

  const authorName = target?.author?.name ?? "Explorador";
  const diasAberto = daysSince(item.firstReportedAt);

  const denunciantes =
    item.reporters && item.reporters.length > 0
      ? item.reporters.map((reporter) => {
          const reporterName = reporter.name?.trim() || "Explorador";
          return {
            nome: reporterName,
            iniciais:
              reporter.initials?.trim() || getInitials(reporterName),
            motivo: mapReasonString(reporter.reason),
            quando: formatarDataRelativa(reporter.createdAt),
            membroDesde: reporter.memberSince
              ? formatarDataCurta(reporter.memberSince)
              : "membro verificado",
            diasDeConta: Number(reporter.accountAgeDays ?? 0),
          };
        })
      : Array.from({
          length: Math.max(
            Number(item.reportersCount ?? 0),
            item.reasons.length,
            1,
          ),
        }).map((_, index) => {
          const reasonText =
            item.reasons[index % Math.max(item.reasons.length, 1)] ??
            "improprio";
          return {
            nome: `Denunciante ${index + 1}`,
            iniciais: `D${index + 1}`,
            motivo: mapReasonString(reasonText),
            quando: diasAberto === 0 ? "hoje" : `há ${diasAberto}d`,
            membroDesde: "membro verificado",
          };
        });

  const textoConteudo =
    target?.content ?? target?.title ?? "Sem conteúdo textual";
  const localConteudo =
    target?.placeName ?? target?.title ?? "Local não especificado";
  const bairroConteudo =
    target?.neighborhood ?? target?.subtitle ?? "Sorocaba";
  const notaConteudo =
    target?.rating !== undefined && target?.rating !== null
      ? Number(target.rating)
      : undefined;

  return {
    id: item.targetId,
    targetTypeEnum,
    alvoTipo,
    alvoNome: target?.placeName ?? target?.title ?? "Conteúdo denunciado",
    autor: {
      id: target?.author?.id,
      nome: authorName,
      iniciais: getInitials(authorName),
      titulo: target?.authorTitle ?? "Explorador",
      membroDesde: target?.authorMemberSince
        ? formatarDataCurta(target.authorMemberSince)
        : target?.createdAt
          ? formatarDataCurta(target.createdAt)
          : "recente",
      avaliacoesEscritas: Number(target?.authorReviewsCount ?? 0),
      conteudoRemovido: Number(target?.authorRemovedContentCount ?? 0),
    },
    diasAberto,
    trecho: textoConteudo,
    conteudo: {
      corpo: textoConteudo,
      local: localConteudo,
      bairro: bairroConteudo,
      data: new Date(
        target?.createdAt ?? item.firstReportedAt,
      ).toLocaleDateString("pt-BR"),
      nota: notaConteudo,
      categoria: target?.categoryName ?? undefined,
      coordenadas: target?.coordinates ?? undefined,
      avaliacaoMae: target?.parentReviewContent
        ? {
            autor: "",
            nota: notaConteudo ?? 0,
            corpo: target.parentReviewContent,
          }
        : undefined,
    },
    denunciantes,
  };
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

    return rawItems.map((reportItem) =>
      mapApiReportToLocal(reportItem as EnrichedAdminGroupedReportItemDto),
    );
  }, [reportsResponse]);

  const initialFeedback = useMemo<FeedbackMock[]>(() => {
    const rawItems =
      feedbackResponse.status === 200 ? feedbackResponse.data.items : [];

    const kindMap: Record<string, FeedbackKind> = {
      0: "bug",
      1: "sugestao",
      2: "elogio",
      bug: "bug",
      suggestion: "sugestao",
      sugestao: "sugestao",
      compliment: "elogio",
      praise: "elogio",
      elogio: "elogio",
    };

    return rawItems.map((item) => {
      const authorName = item.author?.name?.trim();
      const rawCategory = String(item.category ?? "").toLowerCase();
      return {
        id: item.id,
        tipo: kindMap[rawCategory] ?? "sugestao",
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

