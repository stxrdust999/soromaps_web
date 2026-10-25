"use client";

import type { Table } from "@tanstack/react-table";
import {
  ClockIcon,
  MailIcon,
  MapPinIcon,
  ShieldAlertIcon,
  ShieldIcon,
  UserIcon,
  UserSearchIcon,
} from "lucide-react";
import { useCallback } from "react";

import { ColumnVisibilityFilter } from "@/components/table/column-visibility-filter";
import {
  DateFilterChip,
  type SelectFilterChipOption,
  SelectFilterChip,
  TextFilterChip,
} from "@/components/table/filter-chip";
import { FilterChipsScrollArea } from "@/components/table/filter-chips-scroll-area";
import { FilterResetButton } from "@/components/table/filter-reset-button";
import type { UserResource } from "@/types/user";
import { columnIsVisible } from "@/utils/table/column-is-visible";
import { hasActiveFilters } from "@/utils/table/has-active-filters";

import { userColumnsNames } from "./columns";

interface UserListTableToolbarProps {
  table: Table<UserResource>;
}

const ROLE_OPTIONS: SelectFilterChipOption[] = [
  { value: "user", label: "Explorador", icon: <UserIcon className="size-4" /> },
  { value: "admin", label: "Administrador", icon: <ShieldAlertIcon className="size-4" /> },
];

export function UserListTableToolbar({ table }: UserListTableToolbarProps) {
  const nameColumn = table.getColumn("name");
  const emailColumn = table.getColumn("email");
  const roleColumn = table.getColumn("role");
  const neighborhoodColumn = table.getColumn("neighborhood");
  const createdAtColumn = table.getColumn("createdAt");

  const activeFilters = hasActiveFilters({ table });

  const clearTableFilters = useCallback(() => {
    table.resetColumnFilters();
    table.resetSorting();
  }, [table]);

  return (
    <div className="flex items-start justify-between gap-3">
      <FilterChipsScrollArea>
        {nameColumn && (
          <TextFilterChip
            table={table}
            column={nameColumn}
            icon={<UserSearchIcon className="size-4" />}
            label="Nome"
          />
        )}

        {emailColumn && (
          <TextFilterChip
            table={table}
            column={emailColumn}
            icon={<MailIcon className="size-4" />}
            label={userColumnsNames.email}
          />
        )}

        {roleColumn && (
          <SelectFilterChip
            table={table}
            column={roleColumn}
            icon={<ShieldIcon className="size-4" />}
            label={userColumnsNames.role}
            options={ROLE_OPTIONS}
          />
        )}

        {neighborhoodColumn && (
          <TextFilterChip
            table={table}
            column={neighborhoodColumn}
            icon={<MapPinIcon className="size-4" />}
            label={userColumnsNames.neighborhood}
          />
        )}

        {createdAtColumn && (
          <DateFilterChip
            table={table}
            column={createdAtColumn}
            icon={<ClockIcon className="size-4" />}
            label={userColumnsNames.createdAt}
            disabled={!columnIsVisible({ table, columnId: "createdAt" })}
            disabledHint={`Habilite a coluna "${userColumnsNames.createdAt}" para filtrar`}
          />
        )}
      </FilterChipsScrollArea>

      {activeFilters && <FilterResetButton action={clearTableFilters} />}

      <ColumnVisibilityFilter table={table} />
    </div>
  );
}
