export type StoryOrigin = "ia" | "equipe";
export type StoryStatus = "rascunho" | "publicada";

/**
 * Local vinculado a uma parada de pauta editorial.
 */
export interface StoryPlaceView {
  id: string;
  nome: string;
  bairro: string;
  categoria: string;
  fotoUrl?: string | null;
}

/**
 * Modelo de visualização de uma pauta editorial tanto para leitura pública quanto para gestão admin.
 */
export interface StoryView {
  id?: string;
  slug: string;
  chapeu: string;
  titulo: string;
  chamada: string;
  corpo: string[];
  fotoUrl: string;
  locais: StoryPlaceView[];
  locaisCount?: number;
  origem: StoryOrigin;
  modelo?: string;
  revisadoPor?: string;
  status: StoryStatus;
  diasAtras: number;
  tempoLeitura: number;
}
