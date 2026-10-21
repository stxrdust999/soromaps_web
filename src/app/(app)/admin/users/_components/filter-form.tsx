"use client";

import type { Table } from "@tanstack/react-table";
import { CalendarIcon } from "lucide-react";
import { use, useMemo } from "react";
import type { useForm } from "react-hook-form";

import { FILTER_FORM_ID } from "@/components/blocks/sheet-filter-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { listUsersResponse } from "@/http/users/users";
import { cn } from "@/lib/utils";
import type { UserResource } from "@/types/user";
import { formatISODate } from "@/utils/formatters/format-date";
import { columnIsVisible } from "@/utils/table/column-is-visible";
import { resolveFilters } from "@/utils/table/resolve-filters";
import type { UserFilterFormSchema } from "@/validations/users";

import { userColumnsNames } from "./columns";

interface UserListFilterFormProps {
  table: Table<UserResource>;
  form: ReturnType<typeof useForm<UserFilterFormSchema>>;
  promises: {
    usersPromise: Promise<listUsersResponse>;
  };

  onClose: () => void;
}

export function UserListFilterForm({
  table,
  form,
  promises,
  onClose,
}: UserListFilterFormProps) {
  const usersResponse = use(promises.usersPromise);
  const totalUsers = useMemo(() => {
    return usersResponse.status === 200 ? usersResponse.data.totalCount : 0;
  }, [usersResponse]);

  const columnVisibility = {
    createdAt: columnIsVisible({ table, columnId: "createdAt" }),
  };

  function onSubmitForm(data: UserFilterFormSchema) {
    const filters = resolveFilters(data);

    table.setColumnFilters(filters);
    table.setPageIndex(0);

    onClose();
  }

  return (
    <Form {...form}>
      <form
        id={FILTER_FORM_ID}
        onSubmit={form.handleSubmit(onSubmitForm)}
        className="w-full space-y-4 py-4"
      >
        <p className="text-muted-foreground text-xs">
          {totalUsers} usuário(s) cadastrado(s).
        </p>

        {/* name - field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{userColumnsNames.name}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Ex.: Arthur"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* email - field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{userColumnsNames.email}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Ex.: arthur@exemplo.com"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* neighborhood - field */}
        <FormField
          control={form.control}
          name="neighborhood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{userColumnsNames.neighborhood}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Ex.: Campolim"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* createdAt - field */}
        <FormField
          control={form.control}
          name="createdAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{userColumnsNames.createdAt}</FormLabel>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <DateField
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!columnVisibility.createdAt}
                    />
                  </div>
                </TooltipTrigger>

                {!columnVisibility.createdAt && (
                  <TooltipContent>
                    <p>
                      Habilite a coluna "{userColumnsNames.createdAt}" para
                      filtrar
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

interface DateFieldProps {
  value?: Date;
  onChange: (date?: Date) => void;
  disabled?: boolean;
}

function DateField({ value, onChange, disabled }: DateFieldProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-4" />
          {value ? formatISODate(value.toISOString()) : "Selecione uma data"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
