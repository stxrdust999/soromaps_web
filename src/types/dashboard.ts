/**
 * Card de fila de trabalho pendente no dashboard administrativo.
 */
export interface AttentionQueueItem {
  label: string;
  href: string;
  pendentes: number;
  aguardandoHaDias: number;
}

/**
 * Fatia da rosca de segmentação de locais por categoria no dashboard.
 */
export interface PlaceSegmentItem {
  categoria: string;
  key: string;
  total: number;
  color?: string;
}

/**
 * Estágio do funil semanal de novos locais no dashboard administrativo.
 */
export interface NewPlaceStageItem {
  label: string;
  key: string;
  total: number;
}

/**
 * Resumo semanal de novos locais cadastrados e sua distribuição por status.
 */
export interface NewPlacesSummary {
  total: number;
  metaAtingida: number;
  variacaoSemanal: number;
  stages: NewPlaceStageItem[];
}

/**
 * Card de indicador numérico com variação percentual no dashboard administrativo.
 */
export interface MetricCardItem {
  label: string;
  hint: string;
  valor: number;
  variacaoSemanal: number;
}

/**
 * Ponto temporal de novos locais e novos usuários no gráfico do dashboard.
 */
export interface WeeklySignupItem {
  semana: string;
  pontos: number;
  usuarios: number;
}

/**
 * Ponto diário de qualidade e completude de cadastros no dashboard.
 */
export interface DataQualityPointItem {
  data: string;
  completos: number;
  incompletos: number;
}

export type AttentionQueueMock = AttentionQueueItem;
export type PlaceSegmentMock = PlaceSegmentItem;
export type NewPlaceStageMock = NewPlaceStageItem;
export type MetricCardMock = MetricCardItem;
export type WeeklySignupMock = WeeklySignupItem;
export type DataQualityPointMock = DataQualityPointItem;

