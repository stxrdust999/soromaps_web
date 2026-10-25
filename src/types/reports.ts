export type ReportTargetKind = "avaliacao" | "comentario" | "ponto" | "perfil";

export const TARGET_LABEL: Record<
  ReportTargetKind,
  { label: string; participio: string }
> = {
  avaliacao: { label: "Avaliação", participio: "denunciada" },
  comentario: { label: "Comentário", participio: "denunciado" },
  ponto: { label: "Ponto", participio: "denunciado" },
  perfil: { label: "Perfil", participio: "denunciado" },
};

export type ReportReason = "spam" | "ofensa" | "falsa" | "improprio" | "escopo";

export const REASON_LABEL: Record<ReportReason, string> = {
  spam: "Spam",
  ofensa: "Ofensa",
  falsa: "Informação falsa",
  improprio: "Conteúdo impróprio",
  escopo: "Fora do escopo",
};

/**
 * Autor do conteúdo denunciado exibido na ficha de análise de denúncia.
 */
export interface ReportedAuthorView {
  id?: string;
  nome: string;
  iniciais: string;
  titulo: string;
  membroDesde: string;
  avaliacoesEscritas: number;
  conteudoRemovido: number;
}

/**
 * Denunciante individual listado em um caso agrupado de denúncia.
 */
export interface ReporterView {
  nome: string;
  iniciais: string;
  motivo: ReportReason;
  quando: string;
  diasDeConta?: number;
  membroDesde?: string;
}

/**
 * Snapshot do conteúdo denunciado adaptado ao tipo do alvo.
 */
export interface ReportedContentView {
  corpo: string;
  local?: string;
  bairro?: string;
  data?: string;
  nota?: number;
  avaliacaoMae?: { autor: string; nota: number; corpo: string };
  categoria?: string;
  coordenadas?: string;
  fotoNome?: string;
  contadores?: { valor: number; rotulo: string }[];
}

/**
 * Caso agrupado de denúncia sobre um mesmo alvo polimórfico.
 */
export interface ReportCaseView {
  id: string;
  targetTypeEnum?: number;
  alvoTipo: ReportTargetKind;
  alvoNome?: string;
  autor: ReportedAuthorView;
  diasAberto: number;
  trecho: string;
  conteudo: ReportedContentView;
  denunciantes: ReporterView[];
}

export type FeedbackKind = "bug" | "sugestao" | "elogio";
export type FeedbackStatus = "novo" | "lido" | "respondido";

export const FEEDBACK_KIND_LABEL: Record<FeedbackKind, string> = {
  bug: "Bug",
  sugestao: "Sugestão",
  elogio: "Elogio",
};

export const FEEDBACK_STATUS_LABEL: Record<FeedbackStatus, string> = {
  novo: "Novo",
  lido: "Lido",
  respondido: "Respondido",
};

/**
 * Mensagem de feedback enviada por um explorador sobre a plataforma.
 */
export interface FeedbackView {
  id: string;
  tipo: FeedbackKind;
  mensagem: string;
  status: FeedbackStatus;
  diasRecebido: number;
  autor?: { nome: string; iniciais: string; titulo: string };
  rota?: string;
  dispositivo?: string;
}

export type ReportedAuthorMock = ReportedAuthorView;
export type ReporterMock = ReporterView;
export type ReportedContentMock = ReportedContentView;
export type ReportCaseMock = ReportCaseView;
export type FeedbackMock = FeedbackView;

