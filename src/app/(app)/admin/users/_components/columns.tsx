"use client";

import type { ColumnDef, VisibilityState } from "@tanstack/react-table";

import { ColumnSortFilter } from "@/components/table/column-sort-filter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { UserResource } from "@/types/user";
import { formatISODateTime } from "@/utils/formatters/format-date";
import { dateSortingFn } from "@/utils/sorts/sort-by-date";
import { textSortingFn } from "@/utils/sorts/sort-by-text";
import { filterByDateFn } from "@/utils/table/filter-by-date";

import { UserListRowAction } from "./row-action";

const userColumnsNames = {
  name: "Nome",
  email: "E-mail",
  role: "Papel",
  neighborhood: "Bairro",
  createdAt: "Criado em",
  actions: "Ações",
};

const defaultColumnVisibility: VisibilityState = {};

const columns: ColumnDef<UserResource>[] = [
  /* select - column */
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todas as linhas"
        className="border border-black/35"
      />
    ),

    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
        className="border border-black/35"
      />
    ),

    enableSorting: false,
    enableHiding: false,

    meta: {
      headerClassName: "w-12 pr-0",
      cellClassName: "w-12 pr-0",
    },
  },

  /* name - column */
  {
    accessorKey: "name",
    header: ({ column }) => (
      <ColumnSortFilter
        column={column}
        title={userColumnsNames.name}
        className="w-full justify-between text-foreground"
      />
    ),

    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar size="sm">
          {row.original.avatarUrl && (
            <AvatarImage src={row.original.avatarUrl} />
          )}

          <AvatarFallback>
            {row.original.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <span className="truncate">{row.original.name}</span>
      </div>
    ),

    sortingFn: textSortingFn((user) => user.name),

    meta: {
      headerClassName: "min-w-56",
      cellClassName: "min-w-56 font-medium",
    },
  },

  /* email - column */
  {
    accessorKey: "email",
    header: ({ column }) => (
      <ColumnSortFilter
        column={column}
        title={userColumnsNames.email}
        className="w-full justify-between text-foreground"
      />
    ),

    sortingFn: textSortingFn((user) => user.email),

    meta: {
      headerClassName: "min-w-64",
      cellClassName: "min-w-64 truncate text-muted-foreground",
    },
  },

  /* role - column */
  {
    accessorKey: "role",
    header: ({ column }) => (
      <ColumnSortFilter
        column={column}
        title={userColumnsNames.role}
        className="w-full justify-between text-foreground"
      />
    ),

    cell: ({ row }) => {
      const isAdmin = row.original.role.toLowerCase() === "admin";
      return (
        <Badge
          variant={isAdmin ? "default" : "outline"}
          className={isAdmin ? "bg-black text-white" : ""}
        >
          {isAdmin ? "Administrador" : "Explorador"}
        </Badge>
      );
    },

    sortingFn: textSortingFn((user) => user.role),

    meta: {
      headerClassName: "min-w-32",
      cellClassName: "min-w-32",
    },
  },

  /* neighborhood - column */
  {
    accessorKey: "neighborhood",
    header: ({ column }) => (
      <ColumnSortFilter
        column={column}
        title={userColumnsNames.neighborhood}
        className="w-full justify-between text-foreground"
      />
    ),

    cell: ({ row }) => row.original.neighborhood ?? "—",

    sortingFn: textSortingFn((user) => user.neighborhood ?? ""),

    meta: {
      headerClassName: "min-w-40",
      cellClassName: "min-w-40 text-muted-foreground",
    },
  },

  /* createdAt - column */
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <ColumnSortFilter
        column={column}
        title={userColumnsNames.createdAt}
        className="w-full justify-between text-foreground"
      />
    ),

    cell: ({ row }) => formatISODateTime(row.original.createdAt),

    filterFn: filterByDateFn((user) => formatISODateTime(user.createdAt)),
    sortingFn: dateSortingFn((user) => formatISODateTime(user.createdAt)),

    meta: {
      visibilityDisplayName: userColumnsNames.createdAt,
      headerClassName: "min-w-44 w-44",
      cellClassName: "min-w-44 w-44 text-muted-foreground",
    },
  },

  /* actions - column */
  {
    id: "actions",
    header: () => userColumnsNames.actions,
    cell: ({ row }) => <UserListRowAction row={row} />,

    enableSorting: false,
    enableHiding: false,

    meta: {
      headerClassName: "w-24",
      cellClassName: "w-24 pr-4 pl-2",
    },
  },
];

export { columns, defaultColumnVisibility, userColumnsNames };
