"use client";

import type { Table } from "@tanstack/react-table";
import {
  CircleDotIcon,
  HashIcon,
  TagIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useCallback } from "react";

import { ColumnVisibilityFilter } from "@/components/table/column-visibility-filter";
import {
  SelectFilterChip,
  type SelectFilterChipOption,
  TextFilterChip,
} from "@/components/table/filter-chip";
import { FilterChipsScrollArea } from "@/components/table/filter-chips-scroll-area";
import { FilterResetButton } from "@/components/table/filter-reset-button";
import { Button } from "@/components/ui/button";
import { hasActiveFilters } from "@/utils/table/has-active-filters";

import { categoryColumnsNames } from "./columns";
import type { CategoryViewModel } from "./use-categories";

const STATUS_OPTIONS: SelectFilterChipOption[] = [
  { value: "ativas", label: "Só ativas" },
  { value: "inativas", label: "Só inativas" },
];

const RANGE_OPTIONS: SelectFilterChipOption[] = [
  { value: "zero", label: "Sem nenhum ponto" },
  { value: "ate100", label: "Até 100 pontos" },
  { value: "mais100", label: "Mais de 100 pontos" },
];

interface CategoriesToolbarProps {
  table: Table<CategoryViewModel>;

  /**
   * Alerta de cor fica fora do `ColumnFiltersState`: ele compara a categoria
   * com o catálogo inteiro, e `filterFn` só enxerga a própria linha.
   */
  onlyCollisions: boolean;
  onOnlyCollisionsChange: (value: boolean) => void;
}

/**
 * Toolbar no mesmo padrão de `/admin/users`: um chip por filtro, cada um
 * ligado direto ao filtro da sua coluna — expandir revela o controle,
 * recolher limpa aquele filtro.
 */
export function CategoriesToolbar({
  table,
  onlyCollisions,
  onOnlyCollisionsChange,
}: CategoriesToolbarProps) {
  const nomeColumn = table.getColumn("nome");
  const ativaColumn = table.getColumn("ativa");
  const pontosColumn = table.getColumn("pontos");

  const activeFilters = hasActiveFilters({ table }) || onlyCollisions;

  const clearTableFilters = useCallback(() => {
    table.resetColumnFilters();
    table.resetSorting();

    onOnlyCollisionsChange(false);
  }, [table, onOnlyCollisionsChange]);

  return (
    <div className="flex items-start justify-between gap-3">
      <FilterChipsScrollArea>
        {nomeColumn && (
          <TextFilterChip
            table={table}
            column={nomeColumn}
            icon={<TagIcon className="size-4" />}
            label={categoryColumnsNames.nome}
            placeholder="Nome ou slug..."
          />
        )}

        {ativaColumn && (
          <SelectFilterChip
            table={table}
            column={ativaColumn}
            icon={<CircleDotIcon className="size-4" />}
            label={categoryColumnsNames.ativa}
            options={STATUS_OPTIONS}
            menuLabel="Exibir"
          />
        )}

        {pontosColumn && (
          <SelectFilterChip
            table={table}
            column={pontosColumn}
            icon={<HashIcon className="size-4" />}
            label={categoryColumnsNames.pontos}
            options={RANGE_OPTIONS}
            menuLabel="Faixa"
          />
        )}

        <Button
          type="button"
          variant={onlyCollisions ? "default" : "outline"}
          aria-pressed={onlyCollisions}
          onClick={() => onOnlyCollisionsChange(!onlyCollisions)}
          className="h-9 shrink-0 font-normal"
        >
          <TriangleAlertIcon className="size-4" />
          Só as com alerta de cor
        </Button>
      </FilterChipsScrollArea>

      {activeFilters && <FilterResetButton action={clearTableFilters} />}

      <ColumnVisibilityFilter table={table} />
    </div>
  );
}
