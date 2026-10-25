"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryViewModel } from "./use-categories";

interface DeleteCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryViewModel;
  categories: CategoryViewModel[];
  onConfirm: (targetId?: string) => void;
  onDeactivate: () => void;
}

/**
 * Exclusão com reatribuição obrigatória.
 *
 * Categoria com ponto vinculado não pode simplesmente sumir: o ponto ficaria
 * sem categoria e desapareceria dos filtros do app sem ninguém notar. Por isso
 * o destino é obrigatório — e por isso "Desativar" fica oferecido ao lado, que
 * é o que o admin costuma querer de verdade.
 */
export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  categories,
  onConfirm,
  onDeactivate,
}: DeleteCategoryDialogProps) {
  const [targetId, setTargetId] = useState<string>("");

  useEffect(() => {
    if (open) setTargetId("");
  }, [open]);

  const hasPoints = category.pontos > 0;
  const blocked = hasPoints && !targetId;

  const targets = categories.filter((option) => option.id !== category.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>Excluir “{category.nome}”</DialogTitle>
          <DialogDescription>
            {hasPoints ? (
              <>
                <strong className="text-foreground">{category.nome}</strong> tem{" "}
                <strong className="text-foreground">
                  {category.pontos.toLocaleString("pt-BR")} pontos
                </strong>
                . Escolha para onde eles vão.
              </>
            ) : (
              "Essa categoria não tem nenhum ponto. A exclusão é imediata e não afeta o mapa."
            )}
          </DialogDescription>
        </DialogHeader>

        {hasPoints && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="reassign-target">Mover os pontos para</Label>

            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger id="reassign-target" className="w-full">
                <SelectValue placeholder="Selecione a categoria destino..." />
              </SelectTrigger>

              <SelectContent>
                {targets.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.nome} · {option.pontos.toLocaleString("pt-BR")}{" "}
                    pontos
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          {category.ativa ? (
            <Button variant="ghost" onClick={onDeactivate}>
              Desativar em vez de excluir
            </Button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={blocked}
              onClick={() => onConfirm(targetId || undefined)}
            >
              Excluir categoria
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
