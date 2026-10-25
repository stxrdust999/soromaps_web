import type {
  AchievementEventKey,
  AchievementIconKey,
  AchievementTargetKind,
} from "@/constants/achievements";

/**
 * Modelo de visualização de uma conquista do catálogo administrativo e de gamificação.
 */
export interface AchievementView {
  id: string;
  nome: string;
  descricao: string;
  evento: AchievementEventKey;
  quantidade: number;
  tipoAlvo: AchievementTargetKind | null;
  alvo: string | null;
  obtencoes: number;
  raridade: number;
  ativa: boolean;
  icone: AchievementIconKey;
  cor: string;
}

export type AchievementMock = AchievementView;

