"use client";

import { useMemo } from "react";

import { RowCommon } from "@/components/table/row-common";
import { TableEmptyState } from "@/components/table/table-empty-state";
import { TableFooter } from "@/components/table/table-footer";
import { TableHeaderTemplate } from "@/components/table/table-header-template";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { useTableConfig } from "@/hooks/table/use-table-config";
import type { AchievementMock } from "@/types/achievements";

import {
  type AchievementRowActions,
  createAchievementColumns,
} from "./columns";
import { AchievementsToolbar } from "./toolbar";

interface AchievementsTableProps {
  achievements: AchievementMock[];

  /** ⚠️ Precisa chegar memoizado — TanStack compara colunas por referência. */
  actions: AchievementRowActions;
}

/**
 * Orquestrador da tabela do catálogo. Todos os cinco filtros são de coluna,
 * então nada precisa ser aplicado fora do `ColumnFiltersState`.
 */
export function AchievementsTable({
  achievements,
  actions,
}: AchievementsTableProps) {
  const columns = useMemo(
    () => createAchievementColumns({ achievements, ...actions }),
    [achievements, actions],
  );

  const config = useTableConfig({
    data: achievements,
    columns,
    defaultSorting: [{ id: "obtencoes", desc: true }],
    perPage: 10,
    getRowId: (row) => row.id,
  });

  return (
    <section className="space-y-4">
      <AchievementsToolbar table={config.table} />

      <div className="bg-background">
        <Table>
          <TableHeader>
            <TableHeaderTemplate header={config.header} />
          </TableHeader>

          <TableBody>
            {config.rows.length ? (
              config.rows.map((row) => <RowCommon key={row.id} row={row} />)
            ) : (
              <TableEmptyState
                columns={columns}
                message="Nenhuma conquista encontrada com esses filtros."
              />
            )}
          </TableBody>
        </Table>
      </div>

      <TableFooter table={config.table} />
    </section>
  );
}
