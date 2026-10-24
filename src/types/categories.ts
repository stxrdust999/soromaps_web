import type { CategoryIconKey } from "@/constants/categories";

/**
 * Modelo de visualização de uma categoria administrativa e seus contadores de uso.
 */
export interface CategoryView {
  id: string;
  nome: string;
  slug: string;
  pontos: number;
  novosNaSemana: number;
  ativa: boolean;
  ordem: number;
  cor: string;
  icone: CategoryIconKey;
}
