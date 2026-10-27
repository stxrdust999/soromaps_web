"use client";

import { useState } from "react";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

export const RETURN_REASONS = [
  {
    value: "incomplete_info",
    label: "Informações incompletas",
    description: "Faltam fotos, descrição ou horários essenciais para o local.",
  },
  {
    value: "wrong_location",
    label: "Localização incorreta",
    description: "Endereço, bairro ou coordenadas do pino não correspondem ao local real.",
  },
  {
    value: "outside_sorocaba",
    label: "Fora de Sorocaba",
    description: "O ponto está situado fora do perímetro municipal de Sorocaba.",
  },
  {
    value: "other",
    label: "Outro motivo",
    description: "Instruções específicas detalhadas na orientação abaixo.",
  },
] as const;

export type ReturnReasonValue = (typeof RETURN_REASONS)[number]["value"];

interface ReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pointName: string;
  onConfirm: (reason: string, note: string) => void;
}

/**
 * Diálogo para devolução de ponto ao autor com motivo estruturado e orientações de ajuste.
 */
export function ReturnDialog({
  open,
  onOpenChange,
  pointName,
  onConfirm,
}: ReturnDialogProps) {
  const [reason, setReason] = useState<ReturnReasonValue>("incomplete_info");
  const [note, setNote] = useState("");

  const trimmedNote = note.trim();
  const isValid = trimmedNote.length > 0;

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(reason, trimmedNote);
    setNote("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle>Devolver “{pointName}” ao autor</DialogTitle>
          <DialogDescription>
            Indique o que precisa ser corrigido pelo autor para que o ponto possa ser aprovado.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground text-sm font-medium">
              Motivo da devolução
            </span>

            <RadioGroup
              value={reason}
              onValueChange={(value) => setReason(value as ReturnReasonValue)}
              className="flex flex-col gap-1.5"
            >
              {RETURN_REASONS.map((option) => (
                <Label
                  key={option.value}
                  className="hover:bg-accent/60 flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 p-3 font-normal transition-colors"
                >
                  <RadioGroupItem value={option.value} className="mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {option.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="return-guidance-note" className="text-muted-foreground text-sm font-medium">
              Orientações para o autor <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="return-guidance-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Explique ao autor o que precisa ser ajustado (ex: favor confirmar o número do endereço ou adicionar uma foto da fachada)."
              className="min-h-24 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="default"
            disabled={!isValid}
            onClick={handleConfirm}
          >
            Devolver para ajuste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
