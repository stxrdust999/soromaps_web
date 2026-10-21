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
import {
  type ModerationItemMock,
  type ModerationStatus,
  moderationQueueMock,
} from "@/mocks/admin-moderation";

/** Filtro de categoria em "todas" — sentinela, porque `Select` não aceita `""`. */
export const ALL_CATEGORIES = "todas";

interface QueueFilters {
  status: ModerationStatus;
  categoria: string;
  soComAlerta: boolean;
}

/**
 * Converte item da API para a representação consumida pelos componentes.
 */
function mapDtoToItemMock(dto: ModerationPlaceItemDto): ModerationItemMock {
  const statusStr: ModerationStatus =
    dto.status === 2
      ? "aprovado"
      : dto.status === 3
        ? "rejeitado"
        : dto.status === 1
          ? "devolvido"
          : "pendente";

  const diffMs = Date.now() - new Date(dto.createdAt).getTime();
  const diasNaFila = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  const dup =
    dto.possibleDuplicates && dto.possibleDuplicates.length > 0
      ? {
          nome: dto.possibleDuplicates[0].name,
          distanciaMetros:
            typeof dto.possibleDuplicates[0].distanceMeters === "string"
              ? parseInt(dto.possibleDuplicates[0].distanceMeters, 10)
              : dto.possibleDuplicates[0].distanceMeters,
          similaridadeNome: 85,
          comparacao: [
            {
              label: "Nome",
              emAnalise: dto.name,
              existente: dto.possibleDuplicates[0].name,
              igual: dto.name.toLowerCase() === dto.possibleDuplicates[0].name.toLowerCase(),
            },
            {
              label: "Bairro",
              emAnalise: dto.neighborhood,
              existente: dto.possibleDuplicates[0].neighborhood,
              igual: dto.neighborhood === dto.possibleDuplicates[0].neighborhood,
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
    status: statusStr,
    autorId: "ana",
    autorNovo:
      (dto.author
        ? typeof dto.author.totalSubmittedPlaces === "string"
          ? parseInt(dto.author.totalSubmittedPlaces, 10)
          : dto.author.totalSubmittedPlaces
        : 0) <= 1,
    duplicata: dup,
    vizinhos: [],
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
 * Item merece atenção antes dos outros: duplicata suspeita, ficha incompleta
 * ou autor sem histórico. Sem alerta = candidato a aprovação rápida.
 */
export function hasAlert(item: ModerationItemMock): boolean {
  return Boolean(item.duplicata || isIncomplete(item) || item.autorNovo);
}

/** Ficha abaixo do mínimo publicável — devolve, não rejeita. */
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
 * Estado da fila de moderação integrado à API real com fallback para os mocks.
 */
export function useModerationQueue() {
  const [items, setItems] = useState<ModerationItemMock[]>(moderationQueueMock);
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
  const [markedIds, setMarkedIds] = useState<string[]>([]);
  const [lastDecidedId, setLastDecidedId] = useState<string | null>(null);

  const [filters, setFilters] = useState<QueueFilters>({
    status: "pendente",
    categoria: ALL_CATEGORIES,
    soComAlerta: false,
  });

  const reload = useCallback(async () => {
    try {
      const response = await listModerationPlaces({
        Page: 1,
        PageSize: 50,
      });

      if (
        response.status === 200 &&
        response.data.items &&
        response.data.items.length > 0
      ) {
        const mapped = response.data.items.map(mapDtoToItemMock);
        setItems(mapped);
        setSelectedId((current) =>
          current && mapped.some((m) => m.id === current)
            ? current
            : mapped[0]?.id ?? null,
        );
      }
    } catch (error) {
      console.error("Erro ao carregar fila de moderação:", error);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const visible = useMemo(
    () => items.filter((item) => matchesFilters(item, filters)),
    [items, filters],
  );

  const selected = visible.find((item) => item.id === selectedId) ?? null;

  const pendingCount = items.filter((i) => i.status === "pendente").length;
  const returnedCount = items.filter((i) => i.status === "devolvido").length;

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
    (status: ModerationStatus): ModerationItemMock | null => {
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

      decidePlaceModerationAction(selected.id, statusCode).then((result) => {
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
