"use client";

import { CheckIcon, EyeOffIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AchievementMock } from "@/types/achievements";

interface DeactivateDialogProps {
  achievement: AchievementMock;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/**
 * Confirmação de desativação.
 *
 * Não é um "tem certeza?" — é a explicação de que desativar **não** é excluir.
 * Conquista concedida é histórico do usuário e não pode sumir do perfil dele
 * porque o admin recalibrou o catálogo; os três pontos existem para deixar
 * claro o que acontece com cada lado.
 */
export function DeactivateDialog({
  achievement,
  onOpenChange,
  onConfirm,
}: DeactivateDialogProps) {
  const points = [
    {
      icon: CheckIcon,
      className: "text-success",
      text:
        achievement.obtencoes > 0
          ? `Os ${achievement.obtencoes.toLocaleString("pt-BR")} usuários que já ganharam mantêm a conquista no perfil.`
          : "Ninguém ganhou esta conquista ainda, então nenhum perfil muda.",
    },
    {
      icon: EyeOffIcon,
      className: "text-muted-foreground",
      text: "Ela sai do catálogo do app e ninguém mais consegue tirar.",
    },
    {
      icon: RotateCcwIcon,
      className: "text-muted-foreground",
      text: "Você pode reativar depois pelo mesmo menu, sem perder o histórico.",
    },
  ];

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>Desativar “{achievement.nome}”</DialogTitle>
          <DialogDescription>
            Conquista não se exclui. Desativar tira ela do catálogo visível sem
            mexer em quem já ganhou.
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-2">
          {points.map((point) => (
            <li key={point.text} className="flex items-start gap-2.5 text-sm">
              <point.icon
                size={14}
                className={`mt-0.5 shrink-0 ${point.className}`}
              />
              {point.text}
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Desativar conquista</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
