"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CategoryViewModel } from "./use-categories";

export interface CategoryRowActions {
  onEdit: (category: CategoryViewModel) => void;
  onDuplicate: (id: string) => void;
  onToggleActive: (id: string) => void;
  onMove: (id: string, delta: number) => void;
  onDelete: (category: CategoryViewModel) => void;
}

interface CategoryRowActionProps extends CategoryRowActions {
  category: CategoryViewModel;
  isFirst: boolean;
  isLast: boolean;
}

/**
 * Ações da linha. Abrem diálogo em vez de navegar para uma rota do slot
 * `@modals` como `/admin/users` faz: o catálogo vive em memória, e uma rota
 * separada não enxerga esse estado — leria o mock original e salvaria no
 * vazio. Vira rota quando a API existir.
 */
export function CategoryRowAction({
  category,
  isFirst,
  isLast,
  onEdit,
  onDuplicate,
  onToggleActive,
  onMove,
  onDelete,
}: CategoryRowActionProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground"
        onClick={() => onEdit(category)}
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

        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Opções</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onSelect={() => onEdit(category)}>
              <PencilIcon className="size-4" />
              Editar
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => onDuplicate(category.id)}>
              <CopyIcon className="size-4" />
              Duplicar
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => onToggleActive(category.id)}>
              {category.ativa ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
              {category.ativa ? "Desativar" : "Ativar"}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              disabled={isFirst}
              onSelect={() => onMove(category.id, -1)}
            >
              <ArrowUpIcon className="size-4" />
              Mover para cima
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={isLast}
              onSelect={() => onMove(category.id, 1)}
            >
              <ArrowDownIcon className="size-4" />
              Mover para baixo
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(category)}
            >
              <Trash2Icon className="size-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
