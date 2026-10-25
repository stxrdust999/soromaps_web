"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { TriangleAlertIcon } from "lucide-react";

import { ColumnSortFilter } from "@/components/table/column-sort-filter";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { textSortingFn } from "@/utils/sorts/sort-by-text";

import { CategoryPin } from "./category-pin";
import { CategoryRowAction, type CategoryRowActions } from "./row-action";
import { findColorCollision, type CategoryViewModel } from "./use-categories";

/** Fonte única de `columnId -> rótulo`, consumida por header e filtro. */
export const categoryColumnsNames = {
  nome: "Categoria",
  slug: "Slug",
  pontos: "Pontos",
  novosNaSemana: "Novos (7 d)",
  ativa: "Status",
  ordem: "Ordem",
  actions: "Ações",
};

interface CreateColumnsOptions extends CategoryRowActions {
  /** Catálogo inteiro — o alerta de cor compara cada linha com as demais. */
  categories: CategoryViewModel[];
}

/**
 * Colunas da tabela de categorias.
 *
 * É fábrica, e não constante como em `/admin/users`, porque as ações de linha
 * abrem diálogo no componente de tela em vez de navegar para uma rota — os
 * callbacks precisam entrar por parâmetro.
 *
 * @param options Callbacks das ações de linha e o catálogo completo.
 * @returns Definições prontas para `useTableConfig`.
 */
export function createCategoryColumns({
  categories,
  ...actions
}: CreateColumnsOptions): ColumnDef<CategoryViewModel>[] {
  const maxPontos = Math.max(...categories.map((c) => c.pontos), 1);
  const lastOrder = categories.length;

  return [
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
        />
      ),

      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      ),

      enableSorting: false,
      enableHiding: false,

      meta: {
        headerClassName: "w-12 pr-0",
        cellClassName: "w-12 pr-0",
      },
    },

    /* nome - column */
    {
      accessorKey: "nome",
      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={categoryColumnsNames.nome}
          className="w-full justify-between text-foreground"
        />
      ),

      cell: ({ row }) => {
        const category = row.original;
        const collision = findColorCollision(
          categories,
          category.cor,
          category.id,
        );

        return (
          <div className="flex items-center gap-3">
            <CategoryPin
              icone={category.icone}
              cor={category.cor}
              className={category.ativa ? undefined : "opacity-45"}
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{category.nome}</span>

                {collision && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="warning">
                        <TriangleAlertIcon size={12} />
                        <span className="text-xs font-light">
                          Cor parecida com {collision.nome}
                        </span>
                      </Badge>
                    </TooltipTrigger>

                    <TooltipContent className="flex items-center gap-4 p-3">
                      <ColorSample category={category} />
                      <ColorSample category={collision} />
                      <p className="max-w-44 text-xs">
                        Lado a lado no mapa esses dois pins não se distinguem à
                        distância.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              <p className="text-muted-foreground font-mono text-xs">
                {category.slug}
              </p>
            </div>
          </div>
        );
      },

      /** Busca por nome **ou** slug: o admin lembra de um dos dois. */
      filterFn: (row, _columnId, value) => {
        const term = String(value).trim().toLowerCase();
        if (!term) return true;

        const { nome, slug } = row.original;
        return `${nome} ${slug}`.toLowerCase().includes(term);
      },

      sortingFn: textSortingFn((category) => category.nome),

      enableHiding: false,

      meta: {
        headerClassName: "min-w-72",
        cellClassName: "min-w-72",
      },
    },

    /* slug - column */
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={categoryColumnsNames.slug}
          className="w-full justify-between text-foreground"
        />
      ),

      cell: ({ row }) => row.original.slug,

      sortingFn: textSortingFn((category) => category.slug),

      meta: {
        visibilityDisplayName: categoryColumnsNames.slug,
        defaultVisibility: false,
        headerClassName: "min-w-40",
        cellClassName: "min-w-40 font-mono text-xs text-muted-foreground",
      },
    },

    /* pontos - column */
    {
      accessorKey: "pontos",
      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={categoryColumnsNames.pontos}
          className="w-full justify-between text-foreground"
        />
      ),

      /** Faixa, não valor: o chip oferece opções, não um número solto. */
      filterFn: (row, _columnId, value) => {
        const { pontos } = row.original;

        if (value === "zero") return pontos === 0;
        if (value === "ate100") return pontos > 0 && pontos <= 100;
        if (value === "mais100") return pontos > 100;

        return true;
      },

      cell: ({ row }) => {
        const { pontos, cor } = row.original;

        return (
          <div className="flex flex-col gap-1.5">
            <span className="font-medium tabular-nums">
              {pontos.toLocaleString("pt-BR")}
            </span>

            <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pontos === 0 ? 0 : Math.max((pontos / maxPontos) * 100, 2)}%`,
                  backgroundColor: cor,
                }}
              />
            </div>
          </div>
        );
      },

      meta: {
        visibilityDisplayName: categoryColumnsNames.pontos,
        headerClassName: "w-40",
        cellClassName: "w-40",
      },
    },

    /* novosNaSemana - column */
    {
      accessorKey: "novosNaSemana",
      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={categoryColumnsNames.novosNaSemana}
          className="w-full justify-between text-foreground"
        />
      ),

      cell: ({ row }) =>
        row.original.novosNaSemana > 0 ? `+${row.original.novosNaSemana}` : "—",

      meta: {
        visibilityDisplayName: categoryColumnsNames.novosNaSemana,
        headerClassName: "w-32",
        cellClassName: "w-32 tabular-nums",
      },
    },

    /* ativa - column */
    {
      accessorKey: "ativa",
      header: () => categoryColumnsNames.ativa,

      cell: ({ row }) => (
        <Badge variant={row.original.ativa ? "success" : "secondary"}>
          {row.original.ativa ? "Ativa" : "Inativa"}
        </Badge>
      ),

      /** O chip trabalha com string; a coluna guarda boolean. */
      filterFn: (row, _columnId, value) =>
        row.original.ativa === (value === "ativas"),

      enableSorting: false,

      meta: {
        visibilityDisplayName: categoryColumnsNames.ativa,
        headerClassName: "w-28",
        cellClassName: "w-28",
      },
    },

    /* ordem - column */
    {
      accessorKey: "ordem",
      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={categoryColumnsNames.ordem}
          className="w-full justify-between text-foreground"
        />
      ),

      meta: {
        visibilityDisplayName: categoryColumnsNames.ordem,
        headerClassName: "w-24",
        cellClassName: "w-24 tabular-nums text-muted-foreground",
      },
    },

    /* actions - column */
    {
      id: "actions",
      header: () => categoryColumnsNames.actions,

      cell: ({ row }) => (
        <CategoryRowAction
          category={row.original}
          isFirst={row.original.ordem === 1}
          isLast={row.original.ordem === lastOrder}
          {...actions}
        />
      ),

      enableSorting: false,
      enableHiding: false,

      meta: {
        headerClassName: "w-24",
        cellClassName: "w-24 pr-4 pl-2",
      },
    },
  ];
}

function ColorSample({ category }: { category: CategoryViewModel }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <CategoryPin icone={category.icone} cor={category.cor} size={26} />
      <span className="text-xs">{category.nome}</span>
      <span className="font-mono text-[10px] opacity-70">{category.cor}</span>
    </div>
  );
}
