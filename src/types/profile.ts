import type { UserAchievement } from "@/components/ui/achievement-badge";

/**
 * Item individual do histórico de visitas do explorador logado.
 */
export interface ProfileVisitItem {
  id: string;
  placeId: string;
  placeName: string;
  neighborhood: string;
  category: string;
  photoUrl: string;
  /** Data da visita em formato ISO curto (`yyyy-MM-dd`). */
  data: string;
  diasAtras: number;
  nota?: number;
}

/**
 * Grupo mensal de visitas para exibição na timeline do perfil.
 */
export interface ProfileVisitGroup {
  rotulo: string;
  visitas: ProfileVisitItem[];
}

/**
 * Contadores consolidados do topo da página de histórico de visitas.
 */
export interface ProfileVisitSummary {
  visitas: number;
  lugares: number;
  bairros: number;
  categorias: number;
}

/**
 * Cobertura geográfica da cidade pelo explorador logado.
 */
export interface ProfileCoverage {
  visitados: number;
  total: number;
  percentual: number;
}

/**
 * Contagem de visitas agrupadas por categoria de local.
 */
export interface ProfileCategoryCount {
  categoria: string;
  visitas: number;
}

/**
 * Ponto semanal ou mensal de atividade do explorador.
 */
export interface ProfileWeekActivity {
  semana: string;
  visitas: number;
  avaliacoes: number;
}

/**
 * Representação de conquista do explorador (desbloqueada ou em progresso).
 */
export interface ProfileAchievement {
  badge: UserAchievement;
  nome: string;
  descricao: string;
  criterio: string;
  atual: number;
  meta: number;
}

/**
 * Item de local salvo na lista de favoritos do explorador.
 */
export interface ProfileFavoriteItem {
  id: string;
  nome: string;
  bairro: string;
  categoria: string;
  fotoUrl: string;
  sobre: string;
  nota: number;
  totalAvaliacoes: number;
  temWifi: boolean;
  petFriendly: boolean;
  melhorHorario?: string;
  tags: string[];
}

const visitDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Formata uma data ISO (`yyyy-MM-dd` ou timestamp) no padrão `dd/MM/yyyy` em UTC.
 */
export function formatVisitDate(dateIso: string): string {
  const parsedDate = new Date(dateIso);
  if (Number.isNaN(parsedDate.getTime()))
    return dateIso;
  return visitDateFormatter.format(parsedDate);
}
