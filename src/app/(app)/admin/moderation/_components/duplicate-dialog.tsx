"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { DuplicateHintMock } from "@/types/moderation";

interface DuplicateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pointName: string;
  duplicate: DuplicateHintMock;
  onMerge: () => void;
  onKeepBoth: () => void;
}

/**
 * Comparação campo a campo com o ponto já aprovado.
 */
export function DuplicateDialog({
  open,
  onOpenChange,
  pointName,
  duplicate,
  onMerge,
  onKeepBoth,
}: DuplicateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-210">
        <DialogHeader>
          <DialogTitle>Comparação de duplicata</DialogTitle>
          <DialogDescription>
            {duplicate.distanciaMetros} m de distância · nome{" "}
            {duplicate.similaridadeNome}% similar
          </DialogDescription>
        </DialogHeader>

        {/* comparison - rows */}
        <div className="max-h-[56vh] overflow-auto">
          <div className="grid grid-cols-[130px_1fr_1fr] items-end gap-4 border-b px-2.5 pb-2.5">
            <span />
            <div>
              <p className="text-primary text-xs">Em análise</p>
              <p className="font-semibold">{pointName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Já aprovado</p>
              <p className="font-semibold">{duplicate.nome}</p>
            </div>
          </div>

          {duplicate.comparacao.map((row, index) => (
            <div
              key={row.label}
              className={cn(
                "grid grid-cols-[130px_1fr_1fr] items-baseline gap-4 rounded-md px-2.5 py-2",
                index % 2 === 1 && "bg-muted/40",
              )}
            >
              <span className="text-muted-foreground text-sm">{row.label}</span>
              <span className={cn("text-sm", !row.igual && "text-warning")}>
                {row.emAnalise}
              </span>
              <span className="text-sm">{row.existente}</span>
            </div>
          ))}
        </div>

        <DialogFooter className="sm:justify-between">
          <span className="text-muted-foreground self-center text-xs">
            Mesclar mantém o ponto existente e aproveita os campos novos.
          </span>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onKeepBoth}>
              São lugares diferentes
            </Button>
            <Button onClick={onMerge}>Mesclar no existente</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
