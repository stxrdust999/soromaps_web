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
export function mapCategoryDtoToViewModel(
  dto: CategoryResponseDto,
): CategoryViewModel {
  return {
    id: dto.id,
    nome: dto.name,
    slug: dto.slug,
    pontos:
      typeof dto.placesCount === "string"
        ? parseInt(dto.placesCount, 10) || 0
        : dto.placesCount,
    novosNaSemana:
      typeof dto.newPlacesThisWeekCount === "string"
        ? parseInt(dto.newPlacesThisWeekCount, 10) || 0
        : dto.newPlacesThisWeekCount,
    ativa: dto.isActive,
    ordem:
      typeof dto.sortOrder === "string"
        ? parseInt(dto.sortOrder, 10) || 1
        : dto.sortOrder,
    cor: dto.color,
    icone: (dto.icon as CategoryIconKey) || "map-pin",
  };
}

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
    initialCategories
      .map(mapCategoryDtoToViewModel)
      .sort((first, second) => first.ordem - second.ordem),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCategories(
      initialCategories
        .map(mapCategoryDtoToViewModel)
        .sort((first, second) => first.ordem - second.ordem),
    );
  }, [initialCategories]);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listCategories({ includeInactive: true });
      if (response.status === 200 && response.data.items) {
        setCategories(
          response.data.items
            .map(mapCategoryDtoToViewModel)
            .sort((first, second) => first.ordem - second.ordem),
        );
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast.error("Não foi possível carregar as categorias.");
    } finally {
      setLoading(false);
    }
  }, []);

  const stats = useMemo(
    () => ({
      total: categories.length,
      ativas: categories.filter((category) => category.ativa).length,
      vazias: categories.filter((category) => category.pontos === 0).length,
      pontos: categories.reduce((sum, category) => sum + category.pontos, 0),
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
      const source = categories.find((category) => category.id === id);
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
      const target = categories.find((category) => category.id === id);
      if (!target) return;

      const result = await toggleCategoryActiveAction(id, !target.ativa);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setCategories((current) =>
        current.map((category) =>
          category.id === id
            ? { ...category, ativa: !category.ativa }
            : category,
        ),
      );
      toast.success("Status atualizado");
    },
    [categories],
  );

  const move = useCallback(
    async (id: string, delta: number) => {
      const sorted = [...categories].sort(
        (first, second) => first.ordem - second.ordem,
      );
      const index = sorted.findIndex((category) => category.id === id);
      const target = index + delta;

      if (index < 0 || target < 0 || target >= sorted.length) return;

      [sorted[index], sorted[target]] = [sorted[target], sorted[index]];
      const renumbered = sorted.map((category, idx) => ({
        ...category,
        ordem: idx + 1,
      }));
      setCategories(renumbered);

      const result = await reorderCategoriesAction(
        renumbered.map((category) => category.id),
      );
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
