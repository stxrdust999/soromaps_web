import type { ExplorerStats } from "@/constants/verification";

/**
 * Avaliação recente exibida no perfil público ou resumo do explorador.
 */
export interface ExplorerReviewView {
  local: {
    id: string;
    nome: string;
    bairro: string;
  };
  nota: number;
  corpo: string;
  diasAtras: number;
  uteis: number;
}

/**
 * Dados consolidados de um explorador da comunidade para o ranking e perfil público.
 */
export interface ExplorerView extends ExplorerStats {
  id: string;
  nome: string;
  iniciais: string;
  avatarUrl?: string;
  bairro: string;
  desde: string;
  conquistas: number;
  pontosCadastrados: number;
  contribuicoesSemana: number;
  bio?: string;
  ultimasAvaliacoes: ExplorerReviewView[];
}

/**
 * Desbloqueio recente de conquista exibido na vitrine da comunidade.
 */
export interface CommunityRecentUnlockView {
  id: string;
  person: ExplorerView;
  badge: {
    id: string;
    name: string;
    trigger: string;
    icon: string;
    color: string;
    rarity: number;
    achievedAt: string;
  };
  diasAtras: number;
}

/**
 * Soma total de contribuições registradas pelo explorador (visitas, avaliações e locais aprovados).
 */
export function totalContributions(explorer: ExplorerView): number {
  return explorer.visitas + explorer.avaliacoes + explorer.pontosCadastrados;
}
