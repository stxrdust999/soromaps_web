"use client";

import { useMemo, useState } from "react";

import { RowCommon } from "@/components/table/row-common";
import { TableEmptyState } from "@/components/table/table-empty-state";
import { TableFooter } from "@/components/table/table-footer";
import { TableHeaderTemplate } from "@/components/table/table-header-template";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { useTableConfig } from "@/hooks/table/use-table-config";

import { createCategoryColumns } from "./columns";
import type { CategoryRowActions } from "./row-action";
import { CategoriesToolbar } from "./toolbar";
import { findColorCollision, type CategoryViewModel } from "./use-categories";

interface CategoriesTableProps {
  categories: CategoryViewModel[];

  /**
   * ⚠️ Precisa chegar memoizado. `columns` deriva dele, e `useTableConfig`
   * compara colunas por referência: um objeto novo a cada render remonta a
   * tabela e derruba ordenação, filtro e página atual.
   */
  actions: CategoryRowActions;
}

/**
 * Orquestrador da tabela.
 *
 * Busca, status e faixa de pontos são filtros de coluna, aplicados pelos chips
 * da toolbar. Só o alerta de cor fica fora: ele compara a categoria com o
 * catálogo inteiro, e `filterFn` recebe uma linha por vez.
 */
export function CategoriesTable({ categories, actions }: CategoriesTableProps) {
  const [onlyCollisions, setOnlyCollisions] = useState(false);

  const data = useMemo(
    () =>
      onlyCollisions
        ? categories.filter((category) =>
            findColorCollision(categories, category.cor, category.id),
          )
        : categories,
    [categories, onlyCollisions],
  );

  const columns = useMemo(
    () => createCategoryColumns({ categories, ...actions }),
    [categories, actions],
  );

  const config = useTableConfig({
    data,
    columns,
    defaultSorting: [{ id: "ordem", desc: false }],
    getRowId: (row) => row.id,
  });

  return (
    <section className="space-y-4">
      <CategoriesToolbar
        table={config.table}
        onlyCollisions={onlyCollisions}
        onOnlyCollisionsChange={(value) => {
          setOnlyCollisions(value);
          config.table.setPageIndex(0);
        }}
      />

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
                message="Nenhuma categoria encontrada com esses filtros."
              />
            )}
          </TableBody>
        </Table>
      </div>

      <TableFooter table={config.table} />
    </section>
  );
}
