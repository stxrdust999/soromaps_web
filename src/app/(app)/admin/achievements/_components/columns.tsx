"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  CopyIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { ColumnSortFilter } from "@/components/table/column-sort-filter";
import { AchievementBadge } from "@/components/ui/achievement-badge";
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
import { TRIGGER_LABEL } from "@/constants/achievements";
import { cn } from "@/lib/utils";
import type { AchievementMock } from "@/types/achievements";
import { textSortingFn } from "@/utils/sorts/sort-by-text";

import { describeCriterion, triggerOf } from "./use-achievements";

export const achievementColumnsNames = {
  nome: "Conquista",
  criterio: "Critério",
  gatilho: "Gatilho",
  obtencoes: "Obtenções",
  raridade: "Raridade",
  ativa: "Status",
  actions: "Ações",
};

export interface AchievementRowActions {
  onEdit: (achievement: AchievementMock) => void;
  onDuplicate: (id: string) => void;
  onPreview: (achievement: AchievementMock) => void;
  onDeactivate: (achievement: AchievementMock) => void;
  onActivate: (achievement: AchievementMock) => void;
}

interface CreateColumnsOptions extends AchievementRowActions {
  achievements: AchievementMock[];
}

/**
 * Colunas do catálogo de conquistas.
 *
 * Fábrica porque as ações abrem diálogo em vez de navegar — mesma razão de
 * `/admin/categories`. O objeto de ações precisa chegar memoizado.
 *
 * @param options Catálogo completo (a barra de obtenções precisa do máximo) e
 * callbacks das ações de linha.
 */
export function createAchievementColumns({
  achievements,
  onEdit,
  onDuplicate,
  onPreview,
  onDeactivate,
  onActivate,
}: CreateColumnsOptions): ColumnDef<AchievementMock>[] {
  const maxObtencoes = Math.max(
    ...achievements.map((item) => item.obtencoes),
    1,
  );

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
          title={achievementColumnsNames.nome}
          className="w-full justify-between text-foreground"
        />
      ),

      cell: ({ row }) => {
        const achievement = row.original;

        return (
          <div className="flex items-center gap-3">
            <AchievementBadge
              layout="icon"
              badgeSize="sm"
              achievement={{
                id: achievement.id,
                name: achievement.nome,
                trigger: triggerOf(achievement),
                icon: achievement.icone,
                color: achievement.cor,
                // Na tabela o disco representa a conquista existindo no
                // catálogo, não um usuário: ativa aparece como desbloqueada.
                achievedAt: achievement.ativa ? "hoje" : null,
              }}
            />

            <div className="min-w-0">
              <p
                className={cn(
                  "truncate font-medium",
                  !achievement.ativa && "text-muted-foreground",
                )}
              >
                {achievement.nome}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {achievement.descricao}
              </p>
            </div>
          </div>
        );
      },

      /** Busca por nome **ou** descrição — o admin lembra de um dos dois. */
      filterFn: (row, _columnId, value) => {
        const term = String(value).trim().toLowerCase();
        if (!term) return true;

        return `${row.original.nome} ${row.original.descricao}`
          .toLowerCase()
          .includes(term);
      },

      sortingFn: textSortingFn((item: AchievementMock) => item.nome),

      enableHiding: false,

      meta: {
        headerClassName: "min-w-64",
        cellClassName: "min-w-64",
      },
    },

    /* criterio - column */
    {
      id: "criterio",
      accessorFn: describeCriterion,

      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={achievementColumnsNames.criterio}
          className="w-full justify-between text-foreground"
        />
      ),

      /** Filtra pelo evento, não pelo texto — a frase é derivada. */
      filterFn: (row, _columnId, value) => row.original.evento === value,

      enableHiding: false,

      meta: {
        headerClassName: "min-w-64",
        cellClassName: "min-w-64",
      },
    },

    /* gatilho - column */
    {
      id: "gatilho",
      accessorFn: triggerOf,

      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={achievementColumnsNames.gatilho}
          className="w-full justify-between text-foreground"
        />
      ),

      cell: ({ row }) => {
        const { label, icon: Icon } = TRIGGER_LABEL[triggerOf(row.original)];

        return (
          <Badge variant="secondary">
            <Icon size={12} />
            <span className="text-xs font-light">{label}</span>
          </Badge>
        );
      },

      meta: {
        visibilityDisplayName: achievementColumnsNames.gatilho,
        headerClassName: "w-36",
        cellClassName: "w-36",
      },
    },

    /* obtencoes - column */
    {
      accessorKey: "obtencoes",
      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={achievementColumnsNames.obtencoes}
          className="w-full justify-between text-foreground"
        />
      ),

      cell: ({ row }) => {
        const { obtencoes, cor } = row.original;

        return (
          <div className="flex flex-col gap-1.5">
            <span className="font-medium tabular-nums">
              {obtencoes.toLocaleString("pt-BR")}
            </span>

            <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${obtencoes === 0 ? 0 : Math.max((obtencoes / maxObtencoes) * 100, 2)}%`,
                  backgroundColor: cor,
                }}
              />
            </div>
          </div>
        );
      },

      meta: {
        visibilityDisplayName: achievementColumnsNames.obtencoes,
        headerClassName: "w-36",
        cellClassName: "w-36",
      },
    },

    /* raridade - column */
    {
      accessorKey: "raridade",
      header: ({ column }) => (
        <ColumnSortFilter
          column={column}
          title={achievementColumnsNames.raridade}
          className="w-full justify-between text-foreground"
        />
      ),

      cell: ({ row }) =>
        row.original.obtencoes === 0 ? (
          <Badge variant="warning">
            <TriangleAlertIcon size={12} />
            <span className="text-xs font-light">Ninguém tirou</span>
          </Badge>
        ) : (
          <span className="tabular-nums">
            {row.original.raridade}% dos usuários
          </span>
        ),

      filterFn: (row, _columnId, value) => {
        if (!value) return true;
        const { obtencoes, raridade } = row.original;

        if (value === "zero") return obtencoes === 0;
        if (value === "rara") return obtencoes > 0 && raridade < 10;
        if (value === "moderada") return raridade >= 10 && raridade <= 50;
        if (value === "comum") return raridade > 50;
        return true;
      },

      meta: {
        visibilityDisplayName: achievementColumnsNames.raridade,
        headerClassName: "w-40",
        cellClassName: "w-40",
      },
    },

    /* ativa - column */
    {
      accessorKey: "ativa",
      header: () => achievementColumnsNames.ativa,

      cell: ({ row }) => (
        <Badge variant={row.original.ativa ? "success" : "secondary"}>
          {row.original.ativa ? "Ativa" : "Inativa"}
        </Badge>
      ),

      filterFn: (row, _columnId, value) =>
        row.original.ativa === (value === "ativa"),

      enableSorting: false,

      meta: {
        visibilityDisplayName: achievementColumnsNames.ativa,
        headerClassName: "w-28",
        cellClassName: "w-28",
      },
    },

    /* actions - column */
    {
      id: "actions",
      header: () => achievementColumnsNames.actions,

      cell: ({ row }) => {
        const achievement = row.original;

        return (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              onClick={() => onEdit(achievement)}
            >
              <PencilIcon className="size-4" />
              <span className="sr-only">Editar</span>
            </Button>

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
                <DropdownMenuItem onSelect={() => onEdit(achievement)}>
                  <PencilIcon className="size-4" />
                  Editar
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={() => onDuplicate(achievement.id)}>
                  <CopyIcon className="size-4" />
                  Duplicar
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={() => onPreview(achievement)}>
                  <SparklesIcon className="size-4" />
                  Ver como o jogador vê
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Não há "Excluir": quem já ganhou mantém a conquista. */}
                <DropdownMenuItem
                  onSelect={() =>
                    achievement.ativa
                      ? onDeactivate(achievement)
                      : onActivate(achievement)
                  }
                >
                  {achievement.ativa ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}

                  <span className="flex flex-col items-start">
                    {achievement.ativa ? "Desativar" : "Ativar"}
                    <span className="text-muted-foreground text-[11.5px] leading-snug">
                      {achievement.ativa
                        ? "Quem já ganhou mantém"
                        : "Volta ao catálogo do app"}
                    </span>
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },

      enableSorting: false,
      enableHiding: false,

      meta: {
        headerClassName: "w-24",
        cellClassName: "w-24 pr-4 pl-2",
      },
    },
  ];
}
