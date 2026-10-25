"use client";

import type { Table } from "@tanstack/react-table";
import { Settings2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ColumnVisibilityFilterProps<TData> {
  table: Table<TData>;
}

/**
 * "Colunas" dropdown. Lists only columns that can hide AND declare
 * `meta.visibilityDisplayName` — that second rule is what keeps the actions
 * and search columns permanently visible.
 *
 * @param props Table instance.
 * @returns The menu, or `null` when no column is hideable.
 */
export function ColumnVisibilityFilter<TData>({
  table,
}: ColumnVisibilityFilterProps<TData>) {
  const columns = table
    .getAllColumns()
    .filter(
      (column) =>
        column.getCanHide() && column.columnDef.meta?.visibilityDisplayName,
    );

  if (!columns.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex flex-row gap-2 border py-4.25"
        >
          <Settings2Icon className="size-4" />
          Colunas
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 shadow-lg">
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
            className="py-2"
          >
            {column.columnDef.meta?.visibilityDisplayName}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
