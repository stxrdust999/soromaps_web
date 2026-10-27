"use client";

import type { Table } from "@tanstack/react-table";
import {
  ActivityIcon,
  GemIcon,
  SearchIcon,
  ToggleLeftIcon,
  ZapIcon,
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
import { TRIGGER_LABEL } from "@/constants/achievements";
import type { AchievementMock } from "@/types/achievements";
import { hasActiveFilters } from "@/utils/table/has-active-filters";

import { achievementColumnsNames } from "./columns";

const EVENT_OPTIONS: SelectFilterChipOption[] = [
  { value: "visitar", label: "Visitar" },
  { value: "avaliar", label: "Avaliar" },
  { value: "favoritar", label: "Favoritar" },
  { value: "criar", label: "Criar pontos" },
  { value: "comentar", label: "Comentar" },
];

const TRIGGER_OPTIONS: SelectFilterChipOption[] = Object.entries(
  TRIGGER_LABEL,
).map(([value, { label }]) => ({ value, label }));

const STATUS_OPTIONS: SelectFilterChipOption[] = [
  { value: "ativa", label: "Só ativas" },
  { value: "inativa", label: "Só inativas" },
];

const RARITY_OPTIONS: SelectFilterChipOption[] = [
  { value: "zero", label: "Ninguém tirou (0%)" },
  { value: "rara", label: "Rara (< 10%)" },
  { value: "moderada", label: "Moderada (10% - 50%)" },
  { value: "comum", label: "Comum (> 50%)" },
];

interface AchievementsToolbarProps {
  table: Table<AchievementMock>;
}

/** Toolbar no mesmo padrão de `/admin/users`: um chip por filtro de coluna. */
export function AchievementsToolbar({ table }: AchievementsToolbarProps) {
  const nomeColumn = table.getColumn("nome");
  const criterioColumn = table.getColumn("criterio");
  const gatilhoColumn = table.getColumn("gatilho");
  const ativaColumn = table.getColumn("ativa");
  const raridadeColumn = table.getColumn("raridade");

  const activeFilters = hasActiveFilters({ table });

  const clearTableFilters = useCallback(() => {
    table.resetColumnFilters();
    table.resetSorting();
  }, [table]);

  return (
    <div className="flex items-start justify-between gap-3">
      <FilterChipsScrollArea>
        {nomeColumn && (
          <TextFilterChip
            table={table}
            column={nomeColumn}
            icon={<SearchIcon className="size-4" />}
            label={achievementColumnsNames.nome}
            placeholder="Nome ou descrição..."
          />
        )}

        {criterioColumn && (
          <SelectFilterChip
            table={table}
            column={criterioColumn}
            icon={<ActivityIcon className="size-4" />}
            label="Evento"
            options={EVENT_OPTIONS}
            menuLabel="Conta o quê"
          />
        )}

        {gatilhoColumn && (
          <SelectFilterChip
            table={table}
            column={gatilhoColumn}
            icon={<ZapIcon className="size-4" />}
            label={achievementColumnsNames.gatilho}
            options={TRIGGER_OPTIONS}
            menuLabel="Como concede"
          />
        )}

        {raridadeColumn && (
          <SelectFilterChip
            table={table}
            column={raridadeColumn}
            icon={<GemIcon className="size-4" />}
            label={achievementColumnsNames.raridade}
            options={RARITY_OPTIONS}
            menuLabel="Faixa"
          />
        )}

        {ativaColumn && (
          <SelectFilterChip
            table={table}
            column={ativaColumn}
            icon={<ToggleLeftIcon className="size-4" />}
            label={achievementColumnsNames.ativa}
            options={STATUS_OPTIONS}
            menuLabel="Exibir"
          />
        )}
      </FilterChipsScrollArea>

      {activeFilters && <FilterResetButton action={clearTableFilters} />}

      <ColumnVisibilityFilter table={table} />
    </div>
  );
}
