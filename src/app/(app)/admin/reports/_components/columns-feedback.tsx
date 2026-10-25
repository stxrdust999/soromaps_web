"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  BugIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  HeartIcon,
  LightbulbIcon,
  MailCheckIcon,
  UserIcon,
} from "lucide-react";

import { ColumnSortFilter } from "@/components/table/column-sort-filter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  FEEDBACK_KIND_LABEL,
  FEEDBACK_STATUS_LABEL,
  type FeedbackKind,
  type FeedbackMock,
} from "@/types/reports";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";
import { textSortingFn } from "@/utils/sorts/sort-by-text";

export const feedbackColumnsNames = {
  tipo: "Tipo",
  mensagem: "Mensagem",
  autor: "De",
  contexto: "Contexto",
  diasRecebido: "Recebido",
  status: "Status",
  actions: "Ações",
};

const KIND_ICON: Record<FeedbackKind, typeof BugIcon> = {
  bug: BugIcon,
  sugestao: LightbulbIcon,
  elogio: HeartIcon,
};

const KIND_VARIANT = {
  bug: "destructive",
  sugestao: "default",
  elogio: "success",
} as const;

export interface FeedbackRowActions {
  onToggleExpand: (id: string) => void;
  onMarkRead: (item: FeedbackMock) => void;
  onMarkAnswered: (item: FeedbackMock) => void;
}

interface CreateColumnsOptions extends FeedbackRowActions {
  /** Id da linha com a mensagem aberta. */
  expandedId: string | null;
}

/**
 * Colunas da triagem de feedback.
 *
 * Feedback **não tem alvo**: não há o que remover nem quem punir. Por isso as
 * ações são só de status, e a coluna de contexto existe para o bug — rota e
 * dispositivo são o que separa "não funciona" de relato acionável.
 *
 * @param options Linha expandida e callbacks de triagem.
 */
export function createFeedbackColumns({
  expandedId,
  onToggleExpand,
  onMarkRead,
  onMarkAnswered,
}: CreateColumnsOptions): ColumnDef<FeedbackMock>[] {
  return [
    /* tipo - column */
    {
      accessorKey: "tipo",
      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={feedbackColumnsNames.tipo}
          className="w-full justify-between text-foreground"
        />
      ),

      cell: ({ row }) => {
        const Icon = KIND_ICON[row.original.tipo];

        return (
          <Badge variant={KIND_VARIANT[row.original.tipo]}>
            <Icon size={12} />
            <span className="text-xs font-light">
              {FEEDBACK_KIND_LABEL[row.original.tipo]}
            </span>
          </Badge>
        );
      },

      filterFn: (row, _columnId, value) => row.original.tipo === value,

      enableHiding: false,

      meta: {
        headerClassName: "w-28",
        cellClassName: "w-28 align-top",
      },
    },

    /* mensagem - column */
    {
      accessorKey: "mensagem",
      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={feedbackColumnsNames.mensagem}
          className="w-full justify-between text-foreground"
        />
      ),

      cell: ({ row }) => {
        const expanded = expandedId === row.original.id;

        return (
          <button
            type="button"
            onClick={() => onToggleExpand(row.original.id)}
            className="w-full text-left"
          >
            <p
              className={cn(
                "text-sm leading-relaxed",
                expanded ? "text-pretty" : "line-clamp-1",
              )}
            >
              {row.original.mensagem}
            </p>

            {expanded && (
              <span className="text-muted-foreground mt-1.5 inline-block text-xs">
                recolher
              </span>
            )}
          </button>
        );
      },

      sortingFn: textSortingFn((item: FeedbackMock) => item.mensagem),

      enableHiding: false,

      meta: {
        headerClassName: "min-w-85",
        cellClassName: "min-w-85 align-top whitespace-normal",
      },
    },

    /* autor - column */
    {
      id: "autor",
      accessorFn: (item) => item.autor?.nome ?? "",

      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={feedbackColumnsNames.autor}
          className="w-full justify-between text-foreground"
        />
      ),

      cell: ({ row }) => {
        const { autor } = row.original;

        if (!autor) {
          return (
            <div className="flex items-center gap-2.5">
              <span className="text-muted-foreground flex size-6.5 items-center justify-center rounded-full border border-dashed">
                <UserIcon size={12} />
              </span>

              <div>
                <p className="text-muted-foreground text-sm">anônimo</p>
                <p className="text-muted-foreground/80 text-[11.5px]">
                  sem como responder
                </p>
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2.5">
            <Avatar className="size-6.5">
              <AvatarFallback className="text-[10.5px]">
                {autor.iniciais}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{autor.nome}</p>
              <p className="text-muted-foreground truncate text-[11.5px]">
                {autor.titulo}
              </p>
            </div>
          </div>
        );
      },

      /** Recorte por autoria — é o que a decisão sobre anônimo precisa medir. */
      filterFn: (row, _columnId, value) =>
        value === "anonimo" ? !row.original.autor : Boolean(row.original.autor),

      meta: {
        visibilityDisplayName: feedbackColumnsNames.autor,
        headerClassName: "w-44",
        cellClassName: "w-44 align-top",
      },
    },

    /* contexto - column */
    {
      id: "contexto",
      accessorFn: (item) => item.rota ?? "",

      header: () => feedbackColumnsNames.contexto,

      cell: ({ row }) => {
        const { rota, dispositivo } = row.original;

        if (!rota) {
          return <span className="text-muted-foreground/60">—</span>;
        }

        return (
          <div>
            <p className="font-mono text-xs">{rota}</p>
            <p className="text-muted-foreground text-[11.5px]">{dispositivo}</p>
          </div>
        );
      },

      enableSorting: false,

      meta: {
        visibilityDisplayName: feedbackColumnsNames.contexto,
        headerClassName: "w-40",
        cellClassName: "w-40 align-top",
      },
    },

    /* diasRecebido - column */
    {
      accessorKey: "diasRecebido",
      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={feedbackColumnsNames.diasRecebido}
          className="w-full justify-between text-foreground"
        />
      ),

      cell: ({ row }) => formatWaitingDays(row.original.diasRecebido),

      meta: {
        visibilityDisplayName: feedbackColumnsNames.diasRecebido,
        headerClassName: "w-32",
        cellClassName: "w-32 align-top text-muted-foreground",
      },
    },

    /* status - column */
    {
      accessorKey: "status",
      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={feedbackColumnsNames.status}
          className="w-full justify-between text-foreground"
        />
      ),

      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "novo" ? "default" : "secondary"}
          className={cn(row.original.status === "novo" && "font-semibold")}
        >
          {FEEDBACK_STATUS_LABEL[row.original.status]}
        </Badge>
      ),

      filterFn: (row, _columnId, value) => row.original.status === value,

      meta: {
        visibilityDisplayName: feedbackColumnsNames.status,
        headerClassName: "w-32",
        cellClassName: "w-32 align-top",
      },
    },

    /* actions - column */
    {
      id: "actions",
      header: () => feedbackColumnsNames.actions,

      cell: ({ row }) => {
        const item = row.original;
        const anonymous = !item.autor;

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
              <DropdownMenuItem onSelect={() => onMarkRead(item)}>
                <EyeIcon className="size-4" />
                Marcar como lido
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={anonymous}
                onSelect={() => onMarkAnswered(item)}
              >
                <MailCheckIcon className="size-4" />

                <span className="flex flex-col items-start">
                  Marcar como respondido
                  <span className="text-muted-foreground text-[11.5px] leading-snug">
                    {anonymous
                      ? "Anônimo — sem canal de resposta"
                      : "Contato sai por fora do app"}
                  </span>
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },

      enableSorting: false,
      enableHiding: false,

      meta: {
        headerClassName: "w-20",
        cellClassName: "w-20 pr-4 pl-2 align-top",
      },
    },
  ];
}
