"use client";

import { CheckIcon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ModerationItemMock, ModerationStatus } from "@/types/moderation";

import { QueueItem } from "./queue-item";
import { ALL_CATEGORIES } from "./use-moderation-queue";

const STATUS_OPTIONS: { value: ModerationStatus; label: string }[] = [
  { value: "pendente", label: "Pendentes" },
  { value: "devolvido", label: "Devolvidos" },
  { value: "rejeitado", label: "Rejeitados" },
  { value: "aprovado", label: "Aprovados" },
];

interface QueuePanelProps {
  items: ModerationItemMock[];
  categories: string[];
  tempoMedio: string;
  selectedId: string | null;
  markedIds: string[];
  filters: {
    status: ModerationStatus;
    categoria: string;
    soComAlerta: boolean;
  };
  onSelect: (id: string) => void;
  onToggleMark: (id: string) => void;
  onFilterChange: (patch: {
    status?: ModerationStatus;
    categoria?: string;
    soComAlerta?: boolean;
  }) => void;
  onClearMarks: () => void;
  onApproveMarked: () => void;
  onRejectMarked: () => void;
}

/**
 * Coluna da esquerda da moderação: filtros, fila ordenada por idade e ação em lote.
 */
export function QueuePanel({
  items,
  categories,
  tempoMedio,
  selectedId,
  markedIds,
  filters,
  onSelect,
  onToggleMark,
  onFilterChange,
  onClearMarks,
  onApproveMarked,
  onRejectMarked,
}: QueuePanelProps) {
  return (
    <section className="relative flex h-full flex-col border-r">
      {/* filters - toolbar */}
      <div className="flex shrink-0 flex-col gap-2.5 px-4 pt-3.5 pb-2.5">
        <div className="flex gap-2">
          <Select
            value={filters.status}
            onValueChange={(status) =>
              onFilterChange({ status: status as ModerationStatus })
            }
          >
            <SelectTrigger size="sm" className="flex-1" aria-label="Status">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.categoria}
            onValueChange={(categoria) => onFilterChange({ categoria })}
          >
            <SelectTrigger size="sm" className="flex-1" aria-label="Categoria">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value={ALL_CATEGORIES}>
                Todas as categorias
              </SelectItem>
              {categories.map((categoria) => (
                <SelectItem key={categoria} value={categoria}>
                  {categoria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            variant={filters.soComAlerta ? "default" : "outline"}
            size="xs"
            aria-pressed={filters.soComAlerta}
            onClick={() =>
              onFilterChange({ soComAlerta: !filters.soComAlerta })
            }
          >
            <TriangleAlertIcon />
            Só os com alerta
          </Button>

          <span className="text-muted-foreground text-xs">
            Mais antigos primeiro
          </span>
        </div>
      </div>

      {/* queue - list */}
      <div className="min-h-0 flex-1 overflow-auto px-2 pb-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center px-7 py-16 text-center">
            <div className="bg-success/10 text-success flex size-10 items-center justify-center rounded-full">
              <CheckIcon size={20} />
            </div>

            <p className="mt-3.5 font-semibold">Fila zerada</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Nenhum ponto aguardando decisão.
            </p>
            <p className="text-muted-foreground mt-4 text-sm">
              Tempo médio nesta semana:{" "}
              <span className="text-foreground font-semibold">
                {tempoMedio}
              </span>
            </p>
          </div>
        ) : (
          items.map((item) => (
            <QueueItem
              key={item.id}
              item={item}
              isSelected={item.id === selectedId}
              isMarked={markedIds.includes(item.id)}
              onSelect={() => onSelect(item.id)}
              onToggleMark={() => onToggleMark(item.id)}
            />
          ))
        )}
      </div>

      {/* bulk actions - bar */}
      <div
        className={cn(
          "bg-foreground text-background absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-lg py-2 pr-2 pl-3.5 transition-opacity",
          markedIds.length === 0 && "pointer-events-none opacity-0",
        )}
      >
        <span className="text-sm font-medium whitespace-nowrap">
          {markedIds.length === 1
            ? "1 ponto selecionado"
            : `${markedIds.length} pontos selecionados`}
        </span>

        <div className="ml-auto flex gap-1">
          <Button
            size="xs"
            onClick={onApproveMarked}
            className="bg-background text-foreground hover:bg-background/85"
          >
            Aprovar
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={onRejectMarked}
            className="text-background hover:bg-background/15 hover:text-background"
          >
            Rejeitar
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={onClearMarks}
            className="text-background/70 hover:bg-background/15 hover:text-background"
          >
            Limpar
          </Button>
        </div>
      </div>
    </section>
  );
}
