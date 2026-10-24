"use client";

import type { Table as TableInstance } from "@tanstack/react-table";
import { useCallback, useMemo, useRef, useState } from "react";

import { TableEmptyState } from "@/components/table/table-empty-state";
import { TableFooter } from "@/components/table/table-footer";
import { TableHeaderTemplate } from "@/components/table/table-header-template";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { useTableConfig } from "@/hooks/table/use-table-config";
import { cn } from "@/lib/utils";
import type { ReviewMock } from "@/types/reviews";

import { createReviewColumns, type ReviewRowActions } from "./columns";
import { ReviewRow } from "./review-row";
import { ReviewsToolbar } from "./toolbar";
import type { ReviewSignal } from "./use-reviews";

type OwnerActions = Pick<ReviewRowActions, "onRemove">;

interface ReviewsTableProps {
  reviews: ReviewMock[];
  signalsById: Map<string, ReviewSignal[]>;
  actions: OwnerActions;
  onRemoveSelected: (reviews: ReviewMock[], clearSelection: () => void) => void;
}

/**
 * Orquestrador da tabela administrativa de avaliações.
 */
export function ReviewsTable({
  reviews,
  signalsById,
  actions,
  onRemoveSelected,
}: ReviewsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const tableRef = useRef<TableInstance<ReviewMock> | null>(null);

  const onToggleExpand = useCallback(
    (id: string) => setExpandedId((current) => (current === id ? null : id)),
    [],
  );

  const pivot = useCallback((columnId: string, value: unknown) => {
    const table = tableRef.current;
    if (!table) return;

    table.resetColumnFilters();
    table.getColumn(columnId)?.setFilterValue(value);
    table.setPageIndex(0);
  }, []);

  const columns = useMemo(
    () =>
      createReviewColumns({
        signalsById,
        onToggleExpand,
        onFilterByAuthor: (review) => pivot("autor", review.autorId),
        onFilterByPlace: (review) => pivot("local", review.local.id),
        ...actions,
      }),
    [signalsById, onToggleExpand, pivot, actions],
  );

  const config = useTableConfig({
    data: reviews,
    columns,
    defaultSorting: [{ id: "diasPublicado", desc: false }],
    perPage: 10,
    getRowId: (row) => row.id,
  });

  tableRef.current = config.table;

  const selectedRows = config.table.getFilteredSelectedRowModel().rows;

  return (
    <section className="relative space-y-4">
      <ReviewsToolbar table={config.table} />

      <div className="bg-background">
        <Table>
          <TableHeader>
            <TableHeaderTemplate header={config.header} />
          </TableHeader>

          <TableBody>
            {config.rows.length ? (
              config.rows.map((row) => (
                <ReviewRow
                  key={row.id}
                  row={row}
                  isExpanded={expandedId === row.original.id}
                />
              ))
            ) : (
              <TableEmptyState
                columns={columns}
                message="Nenhuma avaliação encontrada com esses filtros."
              />
            )}
          </TableBody>
        </Table>
      </div>

      <TableFooter table={config.table} />

      <div
        className={cn(
          "bg-foreground text-background sticky bottom-4 mx-auto flex w-fit items-center gap-3 rounded-lg py-2 pr-2 pl-3.5 shadow-lg transition-opacity",
          selectedRows.length === 0 && "pointer-events-none opacity-0",
        )}
      >
        <span className="text-sm font-medium whitespace-nowrap">
          {selectedRows.length === 1
            ? "1 avaliação selecionada"
            : `${selectedRows.length} avaliações selecionadas`}
        </span>

        <div className="flex gap-1">
          <Button
            size="xs"
            onClick={() =>
              onRemoveSelected(
                selectedRows.map((row) => row.original),
                () => config.table.resetRowSelection(),
              )
            }
            className="bg-background text-foreground hover:bg-background/85"
          >
            Remover
          </Button>

          <Button
            size="xs"
            variant="ghost"
            onClick={() => config.table.resetRowSelection()}
            className="text-background/70 hover:bg-background/15 hover:text-background"
          >
            Limpar
          </Button>
        </div>
      </div>
    </section>
  );
}
