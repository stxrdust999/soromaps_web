"use client";

import type { Table } from "@tanstack/react-table";
import {
  CircleDotIcon,
  SearchIcon,
  StarIcon,
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
import type { ReviewMock } from "@/types/reviews";
import { hasActiveFilters } from "@/utils/table/has-active-filters";

import { reviewColumnsNames } from "./columns";

const RATING_OPTIONS: SelectFilterChipOption[] = [5, 4, 3, 2, 1].map(
  (nota) => ({
    value: String(nota),
    label: nota === 1 ? "1 estrela" : `${nota} estrelas`,
  }),
);

const SIGNAL_OPTIONS: SelectFilterChipOption[] = [
  { value: "spam", label: "Suspeita de spam" },
  { value: "duplicada", label: "Duplicada" },
  { value: "discrepante", label: "Discrepante" },
  { value: "nenhum", label: "Sem sinal" },
];

const STATUS_OPTIONS: SelectFilterChipOption[] = [
  { value: "publicada", label: "Publicadas" },
  { value: "removida", label: "Removidas" },
];

interface ReviewsToolbarProps {
  table: Table<ReviewMock>;
}

/**
 * Toolbar da listagem administrativa de avaliações.
 */
export function ReviewsToolbar({ table }: ReviewsToolbarProps) {
  const corpoColumn = table.getColumn("corpo");
  const notaColumn = table.getColumn("nota");
  const sinaisColumn = table.getColumn("sinais");
  const statusColumn = table.getColumn("status");

  const activeFilters = hasActiveFilters({ table });

  const clearTableFilters = useCallback(() => {
    table.resetColumnFilters();
    table.resetSorting();
  }, [table]);

  return (
    <div className="flex items-start justify-between gap-3">
      <FilterChipsScrollArea>
        {corpoColumn && (
          <TextFilterChip
            table={table}
            column={corpoColumn}
            icon={<SearchIcon className="size-4" />}
            label="Busca"
            placeholder="Texto, autor ou local..."
          />
        )}

        {notaColumn && (
          <SelectFilterChip
            table={table}
            column={notaColumn}
            icon={<StarIcon className="size-4" />}
            label={reviewColumnsNames.nota}
            options={RATING_OPTIONS}
            menuLabel="Exatamente"
          />
        )}

        {sinaisColumn && (
          <SelectFilterChip
            table={table}
            column={sinaisColumn}
            icon={<TriangleAlertIcon className="size-4" />}
            label={reviewColumnsNames.sinais}
            options={SIGNAL_OPTIONS}
            menuLabel="Categoria"
          />
        )}

        {statusColumn && (
          <SelectFilterChip
            table={table}
            column={statusColumn}
            icon={<CircleDotIcon className="size-4" />}
            label={reviewColumnsNames.status}
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
