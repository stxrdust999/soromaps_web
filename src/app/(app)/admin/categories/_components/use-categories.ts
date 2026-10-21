"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createCategoryAction,
  deleteCategoryAction,
  reorderCategoriesAction,
  toggleCategoryActiveAction,
  updateCategoryAction,
} from "@/actions/categories";
import type { CategoryIconKey } from "@/constants/categories";
import type { CategoryResponseDto } from "@/http/api.schemas";
import { listCategories } from "@/http/categories/categories";
import { hexDistance } from "@/utils/colors/hex-distance";
import type { CategoryFormSchema } from "@/validations/categories";

/**
 * Normaliza os tipos da API para o consumo dos componentes visuais.
 */
export interface CategoryViewModel {
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

/**
 * Converte CategoryResponseDto para CategoryViewModel.
 */
export function mapCategoryDtoToViewModel(dto: CategoryResponseDto): CategoryViewModel {
  return {
    id: dto.id,
    nome: dto.name,
    slug: dto.slug,
    pontos: typeof dto.placesCount === "string" ? parseInt(dto.placesCount, 10) || 0 : dto.placesCount,
    novosNaSemana:
      typeof dto.newPlacesThisWeekCount === "string"
        ? parseInt(dto.newPlacesThisWeekCount, 10) || 0
        : dto.newPlacesThisWeekCount,
    ativa: dto.isActive,
    ordem: typeof dto.sortOrder === "string" ? parseInt(dto.sortOrder, 10) || 1 : dto.sortOrder,
    cor: dto.color,
    icone: (dto.icon as CategoryIconKey) || "map-pin",
  };
}

/**
 * Abaixo desta distância RGB dois pins deixam de se distinguir à distância no
 * mapa. Calibrado no olho sobre a paleta de `CATEGORY_COLORS`, não medido.
 */
const COLLISION_THRESHOLD = 70;

/**
 * Primeira categoria com cor perto demais da informada.
 */
export function findColorCollision(
  categories: CategoryViewModel[],
  color: string,
  ignoreId?: string | null,
): CategoryViewModel | null {
  return (
    categories.find(
      (category) =>
        category.id !== ignoreId &&
        hexDistance(category.cor, color) < COLLISION_THRESHOLD,
    ) ?? null
  );
}

/**
 * Gerencia o catálogo de categorias conectado com a API e Server Actions.
 */
export function useCategories(initialCategories: CategoryResponseDto[] = []) {
  const [categories, setCategories] = useState<CategoryViewModel[]>(() =>
    initialCategories.map(mapCategoryDtoToViewModel).sort((a, b) => a.ordem - b.ordem),
  );
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listCategories({ includeInactive: true });
      if (response.status === 200 && response.data.items) {
        setCategories(
          response.data.items
            .map(mapCategoryDtoToViewModel)
            .sort((a, b) => a.ordem - b.ordem),
        );
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast.error("Não foi possível carregar as categorias.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialCategories.length === 0) {
      reload();
    }
  }, [initialCategories, reload]);

  const stats = useMemo(
    () => ({
      total: categories.length,
      ativas: categories.filter((c) => c.ativa).length,
      vazias: categories.filter((c) => c.pontos === 0).length,
      pontos: categories.reduce((sum, c) => sum + c.pontos, 0),
    }),
    [categories],
  );

  const save = useCallback(
    async (values: CategoryFormSchema, id: string | null) => {
      const formData = new FormData();
      formData.set("nome", values.nome);
      formData.set("cor", values.cor);
      formData.set("icone", values.icone);
      formData.set("ativa", values.ativa ? "true" : "false");

      const result = id
        ? await updateCategoryAction(id, formData)
        : await createCategoryAction(formData);

      if (!result.success) {
        toast.error(result.message);
        return false;
      }

      toast.success(result.message);
      await reload();
      return true;
    },
    [reload],
  );

  const duplicate = useCallback(
    async (id: string) => {
      const source = categories.find((c) => c.id === id);
      if (!source) return;

      const formData = new FormData();
      formData.set("nome", `${source.nome} (cópia)`);
      formData.set("cor", source.cor);
      formData.set("icone", source.icone);
      formData.set("ativa", "false");

      const result = await createCategoryAction(formData);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Categoria duplicada", {
        description: "A cópia nasce inativa — ajuste cor e ícone antes.",
      });
      await reload();
    },
    [categories, reload],
  );

  const toggleActive = useCallback(
    async (id: string) => {
      const target = categories.find((c) => c.id === id);
      if (!target) return;

      const result = await toggleCategoryActiveAction(id, !target.ativa);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setCategories((current) =>
        current.map((c) => (c.id === id ? { ...c, ativa: !c.ativa } : c)),
      );
      toast.success("Status atualizado");
    },
    [categories],
  );

  const move = useCallback(
    async (id: string, delta: number) => {
      const sorted = [...categories].sort((a, b) => a.ordem - b.ordem);
      const index = sorted.findIndex((c) => c.id === id);
      const target = index + delta;

      if (index < 0 || target < 0 || target >= sorted.length) return;

      [sorted[index], sorted[target]] = [sorted[target], sorted[index]];
      const renumbered = sorted.map((c, idx) => ({ ...c, ordem: idx + 1 }));
      setCategories(renumbered);

      const result = await reorderCategoriesAction(renumbered.map((c) => c.id));
      if (!result.success) {
        toast.error(result.message);
        await reload();
      }
    },
    [categories, reload],
  );

  const remove = useCallback(
    async (id: string, targetId?: string) => {
      const result = await deleteCategoryAction(id, targetId);
      if (!result.success) {
        toast.error(result.message);
        return false;
      }

      toast.success(result.message);
      await reload();
      return true;
    },
    [reload],
  );

  return {
    categories,
    loading,
    stats,
    save,
    duplicate,
    toggleActive,
    move,
    remove,
    reload,
  };
}
