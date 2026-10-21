"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createAchievementAction,
  toggleAchievementActiveAction,
  updateAchievementAction,
} from "@/actions/achievements";
import { ACHIEVEMENT_EVENTS } from "@/constants/achievements";
import {
  type AchievementCriterion,
  formatCriterion,
} from "@/helpers/achievement-criteria";
import { listAchievements } from "@/http/achievements/achievements";
import {
  type AchievementMock,
  achievementsMock,
} from "@/mocks/admin-achievements";
import type { AchievementFormSchema } from "@/validations/achievements";

/** Quantas conquistas cada painel de calibragem mostra. */
export const CALIBRATION_SIZE = 5;

/** Mapeamento de enum numérico da API para chaves do frontend */
const EVENT_NUMBER_TO_KEY: Record<number, AchievementMock["evento"]> = {
  0: "visitar",
  1: "avaliar",
  2: "favoritar",
  3: "criar",
  4: "avaliar", // fallback se 4 for comentar
};

const TARGET_NUMBER_TO_KIND: Record<number, NonNullable<AchievementMock["tipoAlvo"]>> = {
  1: "categoria",
  2: "bairro",
};

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
  return ACHIEVEMENT_EVENTS[achievement.evento]?.trigger ?? "immediate";
}

/**
 * Hook de catálogo e operações de conquistas, integrado com as Server Actions e fallback para mocks.
 */
export function useAchievements() {
  const [achievements, setAchievements] =
    useState<AchievementMock[]>(achievementsMock);
  const [isLoading, setIsLoading] = useState(true);

  // Busca inicial da API
  const refreshAchievements = useCallback(async () => {
    try {
      const res = await listAchievements({ PageSize: 100 });
      if (res.status === 200 && res.data.items.length > 0) {
        const mapped: AchievementMock[] = res.data.items.map((item) => ({
          id: item.id,
          nome: item.name,
          descricao: item.description,
          evento: EVENT_NUMBER_TO_KEY[item.eventType] ?? "visitar",
          quantidade: Number(item.requiredQuantity),
          tipoAlvo: item.targetType ? TARGET_NUMBER_TO_KIND[item.targetType] ?? null : null,
          alvo: item.targetValue ?? null,
          obtencoes: Number(item.holdersCount ?? 0),
          raridade: Number(item.holdersPercentage ?? 0),
          ativa: item.isActive,
          icone: (item.icon as any) ?? "sparkles",
          cor: item.color ?? "#000000",
        }));
        setAchievements(mapped);
      }
    } catch {
      // Mantém fallback de mocks
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAchievements();
  }, [refreshAchievements]);

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
    () => [...achievements].sort((a, b) => b.obtencoes - a.obtencoes),
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
        const res = await updateAchievementAction(id, values);
        if (!res.success) {
          toast.error(res.message);
          return false;
        }

        setAchievements((current) =>
          current.map((item) =>
            item.id === id ? { ...item, ...values } : item,
          ),
        );
        refreshAchievements();
        return true;
      }

      const res = await createAchievementAction(values);
      if (!res.success) {
        toast.error(res.message);
        return false;
      }

      setAchievements((current) => [
        ...current,
        {
          ...values,
          id: res.achievementId ?? `a${current.length + 1}`,
          obtencoes: 0,
          raridade: 0,
        },
      ]);
      refreshAchievements();
      return true;
    },
    [refreshAchievements],
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

      const res = await createAchievementAction(newValues);
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      setAchievements((current) => [
        ...current,
        {
          ...newValues,
          id: res.achievementId ?? `${source.id}-copia`,
          obtencoes: 0,
          raridade: 0,
        },
      ]);
      refreshAchievements();
    },
    [achievements, refreshAchievements],
  );

  const setActive = useCallback(
    async (id: string, active: boolean) => {
      const res = await toggleAchievementActiveAction(id, active);
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      setAchievements((current) =>
        current.map((item) =>
          item.id === id ? { ...item, ativa: active } : item,
        ),
      );
      refreshAchievements();
    },
    [refreshAchievements],
  );

  return { achievements, stats, calibration, isLoading, save, duplicate, setActive };
}
