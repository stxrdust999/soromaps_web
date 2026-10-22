"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { dismissReportsAction } from "@/actions/reports";
import { listAdminGroupedReports } from "@/http/reports/reports";

import {
  type FeedbackMock,
  type FeedbackStatus,
  feedbackMock,
  type ReportCaseMock,
  type ReportReason,
  reportCasesMock,
  reportedAuthorsMock,
} from "@/mocks/admin-reports";

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
 * Sinais de risco do caso.
 *
 * O de coordenação é o que impede a fila de virar arma: cinco contas criadas
 * ontem reportando o mesmo alvo com o mesmo motivo não é a comunidade
 * sinalizando, e tratar isso como sinal legítimo derruba conteúdo legítimo.
 *
 * @param report Caso agrupado por alvo.
 * @returns Sinais em ordem de gravidade.
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

  if (reportedAuthorsMock[report.autorId].conteudoRemovido > 0) {
    signals.push({
      kind: "reincidente",
      label: "Autor reincidente",
      tone: "warn",
    });
  }

  const reasons = new Set(report.denunciantes.map((r) => r.motivo));
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
 *
 * Motivos convergentes indicam problema real no conteúdo; divergentes
 * costumam indicar desavença pessoal entre quem reporta e quem escreveu.
 *
 * @param report Caso agrupado por alvo.
 * @returns Contagem por motivo, decrescente.
 */
export function tallyReasons(report: ReportCaseMock): ReasonTally[] {
  const counts = new Map<ReportReason, number>();

  for (const reporter of report.denunciantes) {
    counts.set(reporter.motivo, (counts.get(reporter.motivo) ?? 0) + 1);
  }

  const total = report.denunciantes.length;

  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
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
    !report.denunciantes.some((r) => r.motivo === filters.motivo)
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

/**
 * Estado da caixa de entrada. Nem `Denuncia` nem `Feedback` existem no banco:
 * encerrar um caso apenas o tira do array local, e triar feedback só troca o
 * `status`.
 *
 * Quando as entidades existirem, isto vira `src/http/reports` + Server
 * Actions, e a remoção de conteúdo precisa ser **a mesma action** consumida
 * por `/admin/reviews` — senão as regras divergem entre as duas telas.
 */
export function useReports() {
  const [reports, setReports] = useState(reportCasesMock);
  const [feedback, setFeedback] = useState(feedbackMock);

  const [filters, setFilters] = useState<QueueFilters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>("r1");

  // Carrega casos da API quando disponível
  const fetchReports = useCallback(async () => {
    try {
      const res = await listAdminGroupedReports({ PageSize: 50 });
      if (res.status === 200 && res.data.items.length > 0) {
        const mapped: ReportCaseMock[] = res.data.items.map((item) => {
          const kindMap: Record<number, ReportCaseMock["alvoTipo"]> = {
            0: "ponto",
            1: "avaliacao",
            2: "comentario",
          };
          return {
            id: `api-report-${item.targetId}`,
            alvoTipo: kindMap[item.target?.targetType ?? 0] ?? "ponto",
            alvoNome: item.target?.title ?? "Conteúdo denunciado",
            autorId: "jorge",
            conteudo: {
              corpo: item.target?.content ?? "",
              local: item.target?.subtitle ?? "Sorocaba",
            },
            trecho: item.target?.content ?? "",
            diasAberto: 1,
            denunciantes: item.reasons.map((r, rIdx) => ({
              id: rIdx + 1,
              nome: `Denunciante ${rIdx + 1}`,
              iniciais: "D",
              motivo: "inapropriado" as ReportReason,
              detalhe: `${r}`,
              diasAtras: 1,
              quando: "hoje",
              diasDeConta: 30,
            })),
          };
        });

        setReports(mapped);
        setSelectedId(mapped[0]?.id ?? null);
      }
    } catch {
      // Mantém fallback seguro de mocks
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  /** Mais denunciados primeiro: o caso de 6 reports pesa mais que o de 1. */
  const visible = useMemo(
    () =>
      reports
        .filter((report) => matchesFilters(report, filters))
        .sort(
          (a, b) =>
            b.denunciantes.length - a.denunciantes.length ||
            b.diasAberto - a.diasAberto,
        ),
    [reports, filters],
  );

  const selected = visible.find((report) => report.id === selectedId) ?? null;

  const stats = useMemo(
    () => ({
      casos: reports.length,
      coordenadas: reports.filter((report) =>
        getReportSignals(report).some((s) => s.kind === "coordenada"),
      ).length,
      denuncias: reports.reduce((sum, r) => sum + r.denunciantes.length, 0),
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

      // A seleção acompanha o filtro: manter o caso anterior deixaria o painel
      // mostrando algo que acabou de sumir da fila.
      const stillVisible = reports.filter((r) => matchesFilters(r, next));

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
   * Encerra o caso e avança para o próximo. Descartar e remover saem os dois
   * por aqui — a diferença está no que acontece com o conteúdo, não com o caso.
   */
  const closeCase = useCallback((): ReportCaseMock | null => {
    if (!selected) return null;

    const index = visible.findIndex((report) => report.id === selected.id);
    const remaining = visible.filter((report) => report.id !== selected.id);
    const next = remaining[Math.min(index, remaining.length - 1)];

    if (selected.id.startsWith("api-report-")) {
      const targetType = selected.alvoTipo === "ponto" ? "place" : selected.alvoTipo === "avaliacao" ? "review" : "comment";
      const targetId = selected.id.replace("api-report-", "");
      dismissReportsAction(targetType, targetId, "Caso encerrado pelo moderador");
    }

    setReports((current) =>
      current.filter((report) => report.id !== selected.id),
    );
    setSelectedId(next?.id ?? null);

    return selected;
  }, [visible, selected]);

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
    selectedId,
    setSelectedId,
    filters,
    updateFilters,
    clearFilters,
    stats,
    closeCase,
    feedback,
    setFeedbackStatus,
  };
}

export type { FeedbackMock, ReportCaseMock };
