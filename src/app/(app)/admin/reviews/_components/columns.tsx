"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  CopyIcon,
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  MapPinIcon,
  ScanSearchIcon,
  Trash2Icon,
  TriangleAlertIcon,
  UserSearchIcon,
} from "lucide-react";
import Link from "next/link";

import { StarRating } from "@/components/blocks/star-rating";
import { ColumnSortFilter } from "@/components/table/column-sort-filter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { REVIEW_STATUS_LABEL, type ReviewMock } from "@/types/reviews";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";
import { textSortingFn } from "@/utils/sorts/sort-by-text";

import type { ReviewSignal, ReviewSignalKind } from "./use-reviews";

export const reviewColumnsNames = {
  nota: "Nota",
  corpo: "Avaliação",
  autor: "Autor",
  local: "Local",
  sinais: "Sinais",
  diasPublicado: "Publicada",
  status: "Status",
  actions: "Ações",
};

const SIGNAL_ICON: Record<ReviewSignalKind, typeof TriangleAlertIcon> = {
  spam: TriangleAlertIcon,
  duplicada: CopyIcon,
  discrepante: ScanSearchIcon,
};

export interface ReviewRowActions {
  onToggleExpand: (id: string) => void;
  onFilterByAuthor: (review: ReviewMock) => void;
  onFilterByPlace: (review: ReviewMock) => void;
  onRemove: (review: ReviewMock) => void;
  onRestore?: (review: ReviewMock) => void;
}

interface CreateColumnsOptions extends ReviewRowActions {
  signalsById: Map<string, ReviewSignal[]>;
}

/**
 * Colunas da listagem administrativa de avaliações.
 */
export function createReviewColumns({
  signalsById,
  onToggleExpand,
  onFilterByAuthor,
  onFilterByPlace,
  onRemove,
  onRestore,
}: CreateColumnsOptions): ColumnDef<ReviewMock>[] {
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

    /* nota - column */
    {
      accessorKey: "nota",
      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={reviewColumnsNames.nota}
          className="w-full justify-between text-foreground"
        />
      ),

      cell: ({ row }) => <StarRating nota={row.original.nota} showValue />,

      filterFn: (row, _columnId, value) => row.original.nota === Number(value),

      meta: {
        visibilityDisplayName: reviewColumnsNames.nota,
        headerClassName: "w-36",
        cellClassName: "w-36",
      },
    },

    /* corpo - column */
    {
      accessorKey: "corpo",
      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={reviewColumnsNames.corpo}
          className="w-full justify-between text-foreground"
        />
      ),

      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => onToggleExpand(row.original.id)}
          className="w-full text-left"
        >
          <p
            className={cn(
              "line-clamp-2 text-sm leading-relaxed",
              row.original.status === "removida" && "text-muted-foreground",
            )}
          >
            {row.original.corpo}
          </p>
        </button>
      ),

      filterFn: (row, _columnId, value) => {
        const term = String(value).trim().toLowerCase();
        if (!term) return true;

        const authorName = row.original.autor.nome;
        return `${row.original.corpo} ${authorName} ${row.original.local.nome}`
          .toLowerCase()
          .includes(term);
      },

      sortingFn: textSortingFn((review: ReviewMock) => review.corpo),

      enableHiding: false,

      meta: {
        headerClassName: "min-w-85",
        cellClassName: "min-w-85 whitespace-normal",
      },
    },

    /* autor - column */
    {
      id: "autor",
      accessorFn: (review) => review.autor.nome,

      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={reviewColumnsNames.autor}
          className="w-full justify-between text-foreground"
        />
      ),

      cell: ({ row }) => {
        const author = row.original.autor;

        return (
          <div className="flex items-center gap-2.5">
            <Avatar className="size-7">
              <AvatarFallback className="text-[11px]">
                {author.iniciais}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{author.nome}</p>
              <p className="text-muted-foreground truncate text-[11.5px]">
                {author.titulo}
              </p>
            </div>
          </div>
        );
      },

      filterFn: (row, _columnId, value) => row.original.autorId === value,

      meta: {
        visibilityDisplayName: reviewColumnsNames.autor,
        headerClassName: "w-52",
        cellClassName: "w-52",
      },
    },

    /* local - column */
    {
      id: "local",
      accessorFn: (review) => review.local.nome,

      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={reviewColumnsNames.local}
          className="w-full justify-between text-foreground"
        />
      ),

      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {row.original.local.nome}
          </p>

          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="text-muted-foreground text-xs">
              {row.original.local.bairro}
            </span>
            <Badge variant="secondary">{row.original.local.categoria}</Badge>
          </div>
        </div>
      ),

      filterFn: (row, _columnId, value) =>
        row.original.local.id === String(value),

      meta: {
        visibilityDisplayName: reviewColumnsNames.local,
        headerClassName: "w-56",
        cellClassName: "w-56",
      },
    },

    /* sinais - column */
    {
      id: "sinais",
      accessorFn: (review) => signalsById.get(review.id)?.length ?? 0,

      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={reviewColumnsNames.sinais}
          className="w-full justify-between text-foreground"
        />
      ),

      cell: ({ row }) => {
        const signals = signalsById.get(row.original.id) ?? [];

        if (!signals.length)
          return <span className="text-muted-foreground/60">—</span>;

        return (
          <div className="flex flex-wrap gap-1">
            {signals.map((signal) => {
              const Icon = SIGNAL_ICON[signal.kind];

              return (
                <Badge
                  key={signal.kind}
                  variant={signal.tone === "bad" ? "destructive" : "warning"}
                >
                  <Icon size={12} />
                  <span className="text-xs font-light">{signal.label}</span>
                </Badge>
              );
            })}
          </div>
        );
      },

      filterFn: (row, _columnId, value) => {
        const signals = signalsById.get(row.original.id) ?? [];

        if (value === "nenhum") return signals.length === 0;
        return signals.some((signal) => signal.kind === value);
      },

      meta: {
        visibilityDisplayName: reviewColumnsNames.sinais,
        headerClassName: "w-52",
        cellClassName: "w-52",
      },
    },

    /* diasPublicado - column */
    {
      accessorKey: "diasPublicado",
      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={reviewColumnsNames.diasPublicado}
          className="w-full justify-between text-foreground"
        />
      ),

      cell: ({ row }) => formatWaitingDays(row.original.diasPublicado),

      meta: {
        visibilityDisplayName: reviewColumnsNames.diasPublicado,
        headerClassName: "w-32",
        cellClassName: "w-32 text-muted-foreground",
      },
    },

    /* status - column */
    {
      accessorKey: "status",
      header: () => reviewColumnsNames.status,

      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "publicada" ? "success" : "secondary"
          }
        >
          {REVIEW_STATUS_LABEL[row.original.status]}
        </Badge>
      ),

      filterFn: (row, _columnId, value) => row.original.status === value,

      enableSorting: false,

      meta: {
        visibilityDisplayName: reviewColumnsNames.status,
        headerClassName: "w-32",
        cellClassName: "w-32",
      },
    },

    /* actions - column */
    {
      id: "actions",
      header: () => reviewColumnsNames.actions,

      cell: ({ row }) => {
        const review = row.original;
        const removed = review.status === "removida";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground"
              >
                <EllipsisVerticalIcon className="size-4" />
                <span className="sr-only">Abrir ações</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onSelect={() => onFilterByAuthor(review)}>
                <UserSearchIcon className="size-4" />
                Ver todas deste autor
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={() => onFilterByPlace(review)}>
                <MapPinIcon className="size-4" />
                Ver todas deste local
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href={`/places/${review.local.id}`}>
                  <ExternalLinkIcon className="size-4" />
                  Abrir o local
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {!removed && (
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onRemove(review)}
                >
                  <Trash2Icon className="size-4" />
                  Remover avaliação
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },

      enableSorting: false,
      enableHiding: false,

      meta: {
        headerClassName: "w-20",
        cellClassName: "w-20 pr-4 pl-2",
      },
    },
  ];
}
