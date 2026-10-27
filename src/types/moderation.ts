export type ModerationStatus =
  | "pendente"
  | "devolvido"
  | "aprovado"
  | "rejeitado";

export const MODERATION_STATUS_LABEL: Record<ModerationStatus, string> = {
  pendente: "Aguardando decisão",
  devolvido: "Devolvido ao autor",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

export const REJECTION_REASONS = [
  "Duplicata",
  "Local não existe",
  "Foto imprópria",
  "Spam ou teste",
  "Dados insuficientes",
  "Fora de Sorocaba",
] as const;

export type RejectionReason = (typeof REJECTION_REASONS)[number];

export interface ModerationAuthorView {
  id: string;
  nome: string;
  iniciais: string;
  nivel: string;
  enviados: number;
  aprovados: number;
  membroDesde: string;
  avaliacoesEscritas: number;
  isExternalSync?: boolean;
  syncSource?: string;
}

export type ModerationAuthorMock = ModerationAuthorView;

export interface ModerationFieldsView {
  nome: string;
  categoria: string;
  bairro: string;
  coordenadas: string;
  sobre: string | null;
  descricao: string | null;
  temWifi: string | null;
  petFriendly: string | null;
  melhorHorario: string | null;
  segredoLocal: string | null;
}

export type ModerationFieldsMock = ModerationFieldsView;

export const MODERATION_FIELDS: {
  key: keyof ModerationFieldsView;
  label: string;
}[] = [
  { key: "nome", label: "Nome" },
  { key: "categoria", label: "Categoria" },
  { key: "bairro", label: "Bairro" },
  { key: "coordenadas", label: "Coordenadas" },
  { key: "sobre", label: "Sobre" },
  { key: "descricao", label: "Descrição" },
  { key: "temWifi", label: "Tem wi-fi" },
  { key: "petFriendly", label: "Pet friendly" },
  { key: "melhorHorario", label: "Melhor horário" },
  { key: "segredoLocal", label: "Segredo local" },
];

export interface DuplicateComparisonRow {
  label: string;
  emAnalise: string;
  existente: string;
  igual: boolean;
}

export interface DuplicateHintView {
  id?: string;
  nome: string;
  distanciaMetros: number;
  similaridadeNome: number;
  comparacao: DuplicateComparisonRow[];
}

export type DuplicateHintMock = DuplicateHintView;

export interface MapNeighborView {
  x: number;
  y: number;
  suspeito?: boolean;
}

export type MapNeighborMock = MapNeighborView;

export interface ModerationItemView {
  id: string;
  nome: string;
  bairro: string;
  categoria: string;
  status: ModerationStatus;
  autor: ModerationAuthorView;
  diasNaFila: number;
  fotos: number;
  photoUrls?: string[];
  autorNovo?: boolean;
  origemSync?: boolean;
  fonteSync?: string;
  campos: ModerationFieldsView;
  duplicata?: DuplicateHintView;
  vizinhos: MapNeighborView[];
}

export type ModerationItemMock = ModerationItemView;

export interface ModerationDecisionView {
  id: string;
  placeId: string;
  nome: string;
  bairro: string;
  categoria?: string;
  decisao: "aprovado" | "rejeitado" | "devolvido";
  motivo: string | null;
  moderador: string;
  quando: string;
  podeDesfazer: boolean;
}

export type ModerationDecisionMock = ModerationDecisionView;

/**
 * Conta quantos dos dez campos da ficha do ponto vieram preenchidos.
 */
export function countFilledFields(campos: ModerationFieldsView): number {
  return MODERATION_FIELDS.filter(({ key }) => campos[key]).length;
}
