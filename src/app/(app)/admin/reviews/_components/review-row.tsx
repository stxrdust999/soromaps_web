"use client";

import { flexRender, type Row } from "@tanstack/react-table";
import { MessageSquareIcon, Trash2Icon } from "lucide-react";
import { Fragment } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ReviewMock } from "@/types/reviews";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";

interface ReviewRowProps {
  row: Row<ReviewMock>;
  isExpanded: boolean;
}

/**
 * Linha da tabela de avaliações, com painel expansível embaixo.
 */
export function ReviewRow({ row, isExpanded }: ReviewRowProps) {
  const review = row.original;
  const cells = row.getVisibleCells();
  const removed = review.status === "removida";

  return (
    <Fragment>
      <TableRow
        data-state={row.getIsSelected() && "selected"}
        className={cn(isExpanded && "border-b-0", removed && "opacity-70")}
      >
        {cells.map((cell) => (
          <TableCell
            key={cell.id}
            className={cn(cell.column.columnDef.meta?.cellClassName)}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>

      {isExpanded && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={cells.length} className="pt-0 pb-5">
            <div className="bg-muted/40 flex flex-col gap-4 rounded-lg p-4">
              {removed && (
                <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-md border p-2.5 text-sm">
                  <Trash2Icon size={14} className="mt-0.5 shrink-0" />

                  <span>
                    Removida por <strong>{review.removidaPor}</strong> —{" "}
                    {review.motivoRemocao}. O conteúdo saiu da vitrine e
                    continua auditável aqui.
                  </span>
                </div>
              )}

              <p className="text-sm leading-relaxed text-pretty whitespace-pre-line">
                {review.corpo}
              </p>

              {review.comentarios.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
                    <MessageSquareIcon size={12} />
                    {review.comentarios.length === 1
                      ? "1 comentário"
                      : `${review.comentarios.length} comentários`}
                  </span>

                  <ul className="flex flex-col gap-2.5 border-l-2 pl-3.5">
                    {review.comentarios.map((comment) => (
                      <li key={comment.autor} className="flex gap-2.5">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[10px]">
                            {comment.iniciais}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-semibold">
                              {comment.autor}
                            </span>
                            <span className="text-muted-foreground text-[11px]">
                              {formatWaitingDays(comment.diasPublicado)}
                            </span>
                          </div>

                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {comment.corpo}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
}
