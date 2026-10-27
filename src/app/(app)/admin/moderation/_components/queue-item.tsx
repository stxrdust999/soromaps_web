"use client";

import { ClockIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ModerationItemMock } from "@/types/moderation";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";

import { isIncomplete } from "./use-moderation-queue";

const OVERDUE_DAYS = 7;

interface QueueItemProps {
  item: ModerationItemMock;
  isSelected: boolean;
  isMarked: boolean;
  onSelect: () => void;
  onToggleMark: () => void;
}

/**
 * Linha da fila de moderação: foto, identificação, idade e selos de risco.
 */
export function QueueItem({
  item,
  isSelected,
  isMarked,
  onSelect,
  onToggleMark,
}: QueueItemProps) {
  const overdue = item.diasNaFila > OVERDUE_DAYS;
  const age = formatWaitingDays(item.diasNaFila);

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg p-2.5 transition-colors",
        isSelected ? "bg-accent" : "hover:bg-accent/60",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 gap-3 text-left"
      >
        {item.fotos > 0 ? (
          <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-md font-mono text-[10px]">
            {item.fotos}
          </div>
        ) : (
          <div className="text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-md border border-dashed text-center font-mono text-[8px] leading-tight">
            sem
            <br />
            foto
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-sm font-semibold">{item.nome}</span>
            <span className="text-muted-foreground shrink-0 text-xs">
              {item.bairro}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{item.categoria}</Badge>

            {overdue ? (
              <Badge
                className="flex flex-row gap-2 items-center"
                variant="warning"
              >
                <ClockIcon size={12} />
                <span className="text-xs font-light">{age}</span>
              </Badge>
            ) : (
              <span className="text-muted-foreground text-xs">{age}</span>
            )}
          </div>

          {(item.duplicata ||
            isIncomplete(item) ||
            item.autorNovo ||
            item.origemSync) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {item.origemSync && (
                <Badge
                  variant="secondary"
                  className="border-primary/30 bg-primary/10 text-primary"
                >
                  Sync externo · OSM
                </Badge>
              )}
              {item.duplicata && (
                <Badge variant="warning">Possível duplicata</Badge>
              )}
              {isIncomplete(item) && (
                <Badge variant="outline">Cadastro incompleto</Badge>
              )}
              {item.autorNovo && <Badge variant="outline">Autor novo</Badge>}
            </div>
          )}
        </div>
      </button>

      <Checkbox
        checked={isMarked}
        onCheckedChange={onToggleMark}
        aria-label={`Selecionar ${item.nome}`}
        className="mt-1 shrink-0"
      />
    </div>
  );
}
