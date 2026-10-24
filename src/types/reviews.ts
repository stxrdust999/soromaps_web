import type { RemovalReason } from "@/constants/content-removal";

export type ReviewStatus = "publicada" | "removida";

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  publicada: "Publicada",
  removida: "Removida",
};

export interface ReviewAuthorView {
  id: string;
  nome: string;
  iniciais: string;
  titulo: string;
  avatarUrl?: string;
}

export type ReviewAuthorMock = ReviewAuthorView;

export interface ReviewPlaceView {
  id: string;
  nome: string;
  bairro: string;
  categoria: string;
}

export type ReviewPlaceMock = ReviewPlaceView;

export interface ReviewCommentView {
  id?: string;
  autor: string;
  iniciais: string;
  diasPublicado: number;
  corpo: string;
}

export interface ReviewView {
  id: string;
  autorId: string;
  autor: ReviewAuthorView;
  local: ReviewPlaceView;
  nota: number;
  placeRatingAverage?: number;
  corpo: string;
  diasPublicado: number;
  status: ReviewStatus;
  spam?: boolean;
  signals?: string[];
  removidaPor?: string;
  motivoRemocao?: RemovalReason;
  comentarios: ReviewCommentView[];
}

export type ReviewMock = ReviewView;
