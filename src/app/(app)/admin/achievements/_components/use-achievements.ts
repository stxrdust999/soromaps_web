"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createAchievementAction,
  toggleAchievementActiveAction,
  updateAchievementAction,
} from "@/actions/achievements";
import {
  ACHIEVEMENT_EVENTS,
  resolveAchievementIcon,
} from "@/constants/achievements";
import {
  type AchievementCriterion,
  formatCriterion,
} from "@/helpers/achievement-criteria";
import type { listAchievementsResponse } from "@/http/achievements/achievements";
import type { listCategoriesResponse } from "@/http/categories/categories";
import type { listPlacesResponse } from "@/http/places/places";
import type { AchievementMock } from "@/types/achievements";
import type { AchievementFormSchema } from "@/validations/achievements";

/** Quantas conquistas cada painel de calibragem mostra. */
export const CALIBRATION_SIZE = 5;

/** Mapeamento de enum numérico da API para chaves do frontend */
const EVENT_NUMBER_TO_KEY: Record<number, AchievementMock["evento"]> = {
  0: "visitar",
  1: "avaliar",
  2: "favoritar",
  3: "criar",
  4: "avaliar",
};

const TARGET_NUMBER_TO_KIND: Record<
  number,
  NonNullable<AchievementMock["tipoAlvo"]>
> = {
  1: "categoria",
  2: "bairro",
};

const DEFAULT_NEIGHBORHOODS = [
  "Centro",
  "Santa Rosália",
  "Vila Haro",
  "Vila Hortência",
  "Jardim Abaeté",
  "Ipanema das Pedras",
  "Vila Barcelona",
];

/**
 * Critério de uma conquista do catálogo, no formato que os helpers esperam.
 */
export function toCriterion(
  achievement: AchievementMock,
): AchievementCriterion {
  return {
    evento: achievement.evento,
    quantidade: achievement.quantidade,
    tipoAlvo: achievement.tipoAlvo,
    alvo: achievement.alvo,
  };
}

/**
 * Frase do critério pronta para exibição.
 */
export function describeCriterion(achievement: AchievementMock): string {
  return formatCriterion(toCriterion(achievement)) ?? "Critério incompleto";
}

/**
 * Gatilho correspondente ao evento da conquista.
 */
export function triggerOf(achievement: AchievementMock) {
  return ACHIEVEMENT_EVENTS[achievement.evento]?.trigger ?? "metric";
}

interface UseAchievementsOptions {
  achievementsPromise: Promise<listAchievementsResponse>;
  categoriesPromise: Promise<listCategoriesResponse>;
  placesPromise: Promise<listPlacesResponse>;
}

/**
 * Hook de catálogo e operações de conquistas, integrado com Streaming SSR (`React.use()`) e Server Actions.
 */
export function useAchievements({
  achievementsPromise,
  categoriesPromise,
  placesPromise,
}: UseAchievementsOptions) {
  const achievementsResponse = use(achievementsPromise);
  const categoriesResponse = use(categoriesPromise);
  const placesResponse = use(placesPromise);

  const initialAchievements = useMemo<AchievementMock[]>(() => {
    const rawItems =
      achievementsResponse.status === 200
        ? achievementsResponse.data.items
        : [];

    return rawItems.map((item) => ({
      id: item.id,
      nome: item.name,
      descricao: item.description,
      evento: EVENT_NUMBER_TO_KEY[item.eventType] ?? "visitar",
      quantidade: Number(item.requiredQuantity),
      tipoAlvo: item.targetType
        ? (TARGET_NUMBER_TO_KIND[item.targetType] ?? null)
        : null,
      alvo: item.targetValue ?? null,
      obtencoes: Number(item.holdersCount ?? 0),
      raridade: Number(item.holdersPercentage ?? 0),
      ativa: item.isActive,
      icone: resolveAchievementIcon(item.icon),
      cor: item.color ?? "#1447e6",
    }));
  }, [achievementsResponse]);

  const categories = useMemo<string[]>(() => {
    const rawItems =
      categoriesResponse.status === 200 ? categoriesResponse.data.items : [];
    const names = rawItems.map((category) => category.name);
    return names.length > 0 ? names : ["Cafeteria", "Gastronomia", "Parque"];
  }, [categoriesResponse]);

  const neighborhoods = useMemo<string[]>(() => {
    const rawPlaces =
      placesResponse.status === 200 ? placesResponse.data.items : [];
    const uniqueNeighborhoods = Array.from(
      new Set(
        rawPlaces
          .map((place) => place.neighborhood?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((first, second) => first.localeCompare(second, "pt-BR"));

    return uniqueNeighborhoods.length > 0
      ? uniqueNeighborhoods
      : DEFAULT_NEIGHBORHOODS;
  }, [placesResponse]);

  const [achievements, setAchievements] =
    useState<AchievementMock[]>(initialAchievements);

  useEffect(() => {
    setAchievements(initialAchievements);
  }, [initialAchievements]);

  const stats = useMemo(
    () => ({
      total: achievements.length,
      ativas: achievements.filter((item) => item.ativa).length,
      zeradas: achievements.filter((item) => item.obtencoes === 0).length,
      concedidas: achievements.reduce((sum, item) => sum + item.obtencoes, 0),
    }),
    [achievements],
  );

  /** Ordenado por obtenções, para os dois painéis de calibragem. */
  const byPopularity = useMemo(
    () =>
      [...achievements].sort(
        (first, second) => second.obtencoes - first.obtencoes,
      ),
    [achievements],
  );

  const calibration = useMemo(
    () => ({
      mostEarned: byPopularity.slice(0, CALIBRATION_SIZE),
      leastEarned: byPopularity.slice(-CALIBRATION_SIZE).reverse(),
    }),
    [byPopularity],
  );

  const save = useCallback(
    async (values: AchievementFormSchema, id: string | null) => {
      if (id) {
        const response = await updateAchievementAction(id, values);
        if (!response.success) {
          toast.error(response.message);
          return false;
        }

        setAchievements((current) =>
          current.map((item) =>
            item.id === id ? { ...item, ...values } : item,
          ),
        );
        return true;
      }

      const response = await createAchievementAction(values);
      if (!response.success) {
        toast.error(response.message);
        return false;
      }

      setAchievements((current) => [
        ...current,
        {
          ...values,
          id: response.achievementId ?? `a${current.length + 1}`,
          obtencoes: 0,
          raridade: 0,
        },
      ]);
      return true;
    },
    [],
  );

  const duplicate = useCallback(
    async (id: string) => {
      const source = achievements.find((item) => item.id === id);
      if (!source) return;

      const newValues: AchievementFormSchema = {
        nome: `${source.nome} (cópia)`,
        descricao: source.descricao,
        evento: source.evento,
        quantidade: source.quantidade,
        tipoAlvo: source.tipoAlvo,
        alvo: source.alvo,
        ativa: false,
        icone: source.icone,
        cor: source.cor,
      };

      const response = await createAchievementAction(newValues);
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      setAchievements((current) => [
        ...current,
        {
          ...newValues,
          id: response.achievementId ?? `${source.id}-copia`,
          obtencoes: 0,
          raridade: 0,
        },
      ]);
    },
    [achievements],
  );

  const setActive = useCallback(async (id: string, active: boolean) => {
    const response = await toggleAchievementActiveAction(id, active);
    if (!response.success) {
      toast.error(response.message);
      return;
    }

    setAchievements((current) =>
      current.map((item) =>
        item.id === id ? { ...item, ativa: active } : item,
      ),
    );
  }, []);

  return {
    achievements,
    categories,
    neighborhoods,
    stats,
    calibration,
    save,
    duplicate,
    setActive,
  };
}

