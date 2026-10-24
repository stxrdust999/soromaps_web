"use client";

import { FlagIcon } from "lucide-react";
import { type ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";

import { createReportAction } from "@/actions/reports";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type ReportableTargetType = "place" | "review" | "comment" | "user";

const TARGET_TYPE_ENUM_MAP: Record<ReportableTargetType, number> = {
  place: 0,
  review: 1,
  comment: 2,
  user: 3,
};

const TARGET_TYPE_LABEL_MAP: Record<ReportableTargetType, string> = {
  place: "local",
  review: "avaliação",
  comment: "comentário",
  user: "perfil",
};

const REPORT_REASONS = [
  { value: "falsa", label: "Informação falsa ou local inexistente" },
  { value: "spam", label: "Spam ou propaganda comercial" },
  { value: "ofensa", label: "Ofensa ou discurso de ódio" },
  { value: "improprio", label: "Conteúdo impróprio" },
  { value: "escopo", label: "Fora do escopo da plataforma" },
] as const;

interface ReportDialogProps {
  targetType: ReportableTargetType;
  targetId: string;
  targetName?: string;
  targetLabel?: string;
  trigger?: ReactNode;
}

/**
 * Modal reutilizável para envio de denúncias sobre locais, avaliações, comentários ou perfis.
 */
export function ReportDialog({
  targetType,
  targetId,
  targetName,
  targetLabel: customTargetLabel,
  trigger,
}: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("falsa");
  const [details, setDetails] = useState("");
  const [isPending, startTransition] = useTransition();

  const targetLabel = TARGET_TYPE_LABEL_MAP[targetType];
  const displaySubject = targetName ?? customTargetLabel;

  function handleSubmit() {
    startTransition(async () => {
      const response = await createReportAction({
        targetType: TARGET_TYPE_ENUM_MAP[targetType],
        targetId,
        reason,
        details: details.trim() ? details.trim() : null,
      });

      if (response.success) {
        toast.success(response.message);
        setOpen(false);
        setDetails("");
      } else {
        toast.error(response.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
          >
            <FlagIcon className="size-3.5" />
            Denunciar
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Denunciar {targetLabel}</DialogTitle>
          <DialogDescription>
            {displaySubject
              ? `Informe o motivo da denúncia sobre "${displaySubject}". Nossa equipe de moderação analisará o caso.`
              : "Informe o motivo da denúncia para análise da equipe de moderação."}
          </DialogDescription>
        </DialogHeader>

        {/* reason field - section */}
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="report-reason">Motivo principal</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="report-reason">
                <SelectValue placeholder="Selecione um motivo" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((reasonOption) => (
                  <SelectItem
                    key={reasonOption.value}
                    value={reasonOption.value}
                  >
                    {reasonOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* details field - section */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="report-details">
              Detalhes adicionais (opcional)
            </Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Descreva brevemente o problema encontrado..."
              rows={3}
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? "Enviando..." : "Enviar denúncia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
