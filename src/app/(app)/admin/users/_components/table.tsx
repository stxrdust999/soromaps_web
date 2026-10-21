"use client";

import { use, useMemo } from "react";

import { RowCommon } from "@/components/table/row-common";
import { TableEmptyState } from "@/components/table/table-empty-state";
import { TableFooter } from "@/components/table/table-footer";
import { TableHeaderTemplate } from "@/components/table/table-header-template";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { useTableConfig } from "@/hooks/table/use-table-config";
import type { listUsersResponse } from "@/http/users/users";

import { columns, defaultColumnVisibility } from "./columns";
import { UserListTableToolbar } from "./toolbar";

interface UsersTableProps {
  promises: {
    usersPromise: Promise<listUsersResponse>;
  };
}

export function UsersTable({ promises }: UsersTableProps) {
  const usersResponse = use(promises.usersPromise);
  const users = useMemo(() => {
    return usersResponse.status === 200 ? usersResponse.data.items : [];
  }, [usersResponse]);

  const columnDef = useMemo(() => columns, []);
  const defaultVisibility = useMemo(() => defaultColumnVisibility, []);

  const config = useTableConfig({
    data: users,
    columns: columnDef,
    defaultVisibility,
    defaultSorting: [{ id: "name", desc: false }],
  });

  return (
    <section className="space-y-4">
      <UserListTableToolbar table={config.table} />

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
                columns={columnDef}
                message="Nenhum usuário encontrado."
              />
            )}
          </TableBody>
        </Table>
      </div>

      <TableFooter table={config.table} hiddenSelectedRows />
    </section>
  );
}
