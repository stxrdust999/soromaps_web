"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  batchDecideModerationAction,
  decidePlaceModerationAction,
  undoModerationDecisionAction,
} from "@/actions/moderation";
import type { ModerationPlaceItemDto } from "@/http/api.schemas";
import { listModerationPlaces } from "@/http/moderation/moderation";
import type {
  ModerationAuthorMock,
  ModerationItemMock,
  ModerationStatus,
} from "@/types/moderation";

export const ALL_CATEGORIES = "todas";

interface QueueFilters {
  status: ModerationStatus;
  categoria: string;
  soComAlerta: boolean;
}

function parseNumeric(
  value: number | string | null | undefined,
  fallback = 0,
): number {
  if (typeof value === "number")
    return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

/**
 * Converte um `ModerationPlaceItemDto` da API para o contrato visual `ModerationItemMock`.
 */
export function mapDtoToItemMock(
  dto: ModerationPlaceItemDto,
): ModerationItemMock {
  const statusStr: ModerationStatus =
    dto.status === 2
      ? "aprovado"
      : dto.status === 3
        ? "rejeitado"
        : dto.status === 1
          ? "devolvido"
          : "pendente";

  const diffMs = Date.now() - new Date(dto.createdAt).getTime();
  const diasNaFila = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  const enviados = Math.max(
    1,
    parseNumeric(dto.author?.totalSubmittedPlaces, 1),
  );
  const aprovados = parseNumeric(dto.author?.approvedPlacesCount, 0);
  const avaliacoesEscritas = parseNumeric(dto.author?.reviewsWrittenCount, 0);
  const authorName = dto.author?.name ?? "Explorador";
  const initials =
    authorName
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "EX";

  const autor: ModerationAuthorMock = {
    id: dto.author?.id ?? `author-${dto.id}`,
    nome: authorName,
    iniciais: initials,
    nivel: enviados >= 5 ? "Guia local" : "Explorador",
    enviados,
    aprovados,
    membroDesde: dto.author?.joinedAt
      ? new Date(dto.author.joinedAt).toLocaleDateString("pt-BR", {
          month: "short",
          year: "numeric",
        })
      : "recentemente",
    avaliacoesEscritas,
  };

  const dup =
    dto.possibleDuplicates && dto.possibleDuplicates.length > 0
      ? {
          id: dto.possibleDuplicates[0].id,
          nome: dto.possibleDuplicates[0].name,
          distanciaMetros: parseNumeric(
            dto.possibleDuplicates[0].distanceMeters,
            0,
          ),
          similaridadeNome: 85,
          comparacao: [
            {
              label: "Nome",
              emAnalise: dto.name,
              existente: dto.possibleDuplicates[0].name,
              igual:
                dto.name.toLowerCase() ===
                dto.possibleDuplicates[0].name.toLowerCase(),
            },
            {
              label: "Bairro",
              emAnalise: dto.neighborhood,
              existente: dto.possibleDuplicates[0].neighborhood,
              igual:
                dto.neighborhood === dto.possibleDuplicates[0].neighborhood,
            },
          ],
        }
      : undefined;

  return {
    id: dto.id,
    nome: dto.name,
    categoria: dto.category.name,
    bairro: dto.neighborhood,
    diasNaFila,
    fotos: dto.photos.length,
    photoUrls: dto.photos.map((photo) => photo.url),
    status: statusStr,
    autor,
    autorNovo: enviados <= 1,
    duplicata: dup,
    vizinhos: (dto.possibleDuplicates ?? []).map((_, index) => ({
      x: 0.35 + (index * 0.21) % 0.45,
      y: 0.3 + (index * 0.17) % 0.45,
      suspeito: index === 0,
    })),
    campos: {
      nome: dto.name,
      categoria: dto.category.name,
      bairro: dto.neighborhood,
      coordenadas: `${dto.latitude}, ${dto.longitude}`,
      descricao: dto.description || null,
      sobre: dto.about || null,
      melhorHorario: dto.bestTime || null,
      segredoLocal: dto.localSecret || null,
      temWifi: dto.hasWifi ? "Sim" : "Não",
      petFriendly: dto.isPetFriendly ? "Sim" : "Não",
    },
  };
}

/**
 * Verifica se o item na fila possui alerta (duplicata, incompleto ou autor novo).
 */
export function hasAlert(item: ModerationItemMock): boolean {
  return Boolean(item.duplicata || isIncomplete(item) || item.autorNovo);
}

/**
 * Verifica se a ficha do ponto está incompleta.
 */
export function isIncomplete(item: ModerationItemMock): boolean {
  return !item.campos.descricao || item.fotos === 0;
}

function matchesFilters(
  item: ModerationItemMock,
  filters: QueueFilters,
): boolean {
  return (
    item.status === filters.status &&
    (filters.categoria === ALL_CATEGORIES ||
      item.categoria === filters.categoria) &&
    (!filters.soComAlerta || hasAlert(item))
  );
}

/**
 * Estado da fila de moderação conectado à API e Server Actions.
 */
export function useModerationQueue(initialItems: ModerationItemMock[] = []) {
  const [items, setItems] = useState<ModerationItemMock[]>(initialItems);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialItems[0]?.id ?? null,
  );
  const [markedIds, setMarkedIds] = useState<string[]>([]);
  const [lastDecidedId, setLastDecidedId] = useState<string | null>(null);

  const [filters, setFilters] = useState<QueueFilters>({
    status: "pendente",
    categoria: ALL_CATEGORIES,
    soComAlerta: false,
  });

  useEffect(() => {
    setItems(initialItems);
    setSelectedId((current) =>
      current && initialItems.some((item) => item.id === current)
        ? current
        : initialItems[0]?.id ?? null,
    );
  }, [initialItems]);

  const reload = useCallback(async () => {
    try {
      const response = await listModerationPlaces({
        Page: 1,
        PageSize: 50,
      });

      if (response.status === 200 && response.data.items) {
        const mapped = response.data.items.map(mapDtoToItemMock);
        setItems(mapped);
        setSelectedId((current) =>
          current && mapped.some((item) => item.id === current)
            ? current
            : mapped[0]?.id ?? null,
        );
      }
    } catch (error) {
      console.error("Erro ao carregar fila de moderação:", error);
    }
  }, []);

  const visible = useMemo(
    () => items.filter((item) => matchesFilters(item, filters)),
    [items, filters],
  );

  const selected = visible.find((item) => item.id === selectedId) ?? null;

  const pendingCount = items.filter(
    (item) => item.status === "pendente",
  ).length;
  const returnedCount = items.filter(
    (item) => item.status === "devolvido",
  ).length;

  const updateFilters = useCallback(
    (patch: Partial<QueueFilters>) => {
      const next = { ...filters, ...patch };
      const stillVisible = items.filter((item) => matchesFilters(item, next));

      setFilters(next);
      setSelectedId(stillVisible[0]?.id ?? null);
    },
    [filters, items],
  );

  const moveSelection = useCallback(
    (delta: number) => {
      const index = visible.findIndex((item) => item.id === selectedId);
      if (index < 0) return;

      const next =
        visible[Math.min(Math.max(index + delta, 0), visible.length - 1)];
      if (next) setSelectedId(next.id);
    },
    [visible, selectedId],
  );

  const toggleMark = useCallback((id: string) => {
    setMarkedIds((current) =>
      current.includes(id)
        ? current.filter((markedId) => markedId !== id)
        : [...current, id],
    );
  }, []);

  const clearMarks = useCallback(() => setMarkedIds([]), []);

  const decide = useCallback(
    (
      status: ModerationStatus,
      reason?: string | null,
      feedbackNote?: string | null,
    ): ModerationItemMock | null => {
      if (!selected) return null;

      const index = visible.findIndex((item) => item.id === selected.id);
      const remaining = visible.filter((item) => item.id !== selected.id);
      const next = remaining[Math.min(index, remaining.length - 1)];

      const statusCode =
        status === "aprovado" ? 2 : status === "rejeitado" ? 3 : 1;

      setItems((current) =>
        current.map((item) =>
          item.id === selected.id ? { ...item, status } : item,
        ),
      );
      setSelectedId(next?.id ?? null);
      setLastDecidedId(selected.id);

      decidePlaceModerationAction(
        selected.id,
        statusCode,
        reason,
        feedbackNote,
      ).then((result) => {
        if (!result.success) {
          toast.error(result.message);
          reload();
        }
      });

      return selected;
    },
    [visible, selected, reload],
  );

  const decideMarked = useCallback(
    (status: ModerationStatus): number => {
      const count = markedIds.length;
      if (!count) return 0;

      const ids = [...markedIds];
      const statusCode =
        status === "aprovado" ? 2 : status === "rejeitado" ? 3 : 1;

      setItems((current) =>
        current.map((item) =>
          ids.includes(item.id) ? { ...item, status } : item,
        ),
      );
      setMarkedIds([]);

      batchDecideModerationAction(ids, statusCode).then((result) => {
        if (!result.success) {
          toast.error(result.message);
          reload();
        }
      });

      return count;
    },
    [markedIds, reload],
  );

  const undo = useCallback(async () => {
    if (!lastDecidedId) return;

    const result = await undoModerationDecisionAction(lastDecidedId);
    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Decisão desfeita com sucesso.");
    await reload();
  }, [lastDecidedId, reload]);

  return {
    visible,
    selected,
    selectedId,
    setSelectedId,
    markedIds,
    toggleMark,
    clearMarks,
    filters,
    updateFilters,
    moveSelection,
    decide,
    decideMarked,
    undo,
    pendingCount,
    returnedCount,
    reload,
  };
}
