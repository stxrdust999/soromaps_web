"use client";

import { MessageSquarePlusIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";

import { sendFeedbackAction } from "@/actions/feedback";
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

const FEEDBACK_CATEGORIES = [
  { value: "1", label: "Sugestão de melhoria" },
  { value: "0", label: "Relatar um problema (Bug)" },
  { value: "2", label: "Elogio" },
  { value: "3", label: "Outro assunto" },
] as const;

interface FeedbackDialogProps {
  trigger?: ReactNode;
}

/**
 * Modal para envio de sugestões, elogios ou relatos de bugs sobre a plataforma Soromaps.
 */
export function FeedbackDialog({ trigger }: FeedbackDialogProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>("1");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!message.trim()) {
      toast.error("Escreva sua mensagem antes de enviar.");
      return;
    }

    startTransition(async () => {
      const response = await sendFeedbackAction({
        category: Number(category),
        message: message.trim(),
        originPath: pathname,
      });

      if (response.success) {
        toast.success(response.message);
        setOpen(false);
        setMessage("");
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
            className="flex w-full flex-row justify-start gap-3"
          >
            <MessageSquarePlusIcon />
            <p>Enviar feedback</p>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar feedback</DialogTitle>
          <DialogDescription>
            Conte para a equipe do Soromaps o que podemos melhorar, relate um
            bug ou deixe sua sugestão.
          </DialogDescription>
        </DialogHeader>

        {/* category - field */}
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="feedback-category">Tipo de mensagem</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="feedback-category">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_CATEGORIES.map((categoryOption) => (
                  <SelectItem
                    key={categoryOption.value}
                    value={categoryOption.value}
                  >
                    {categoryOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* message - field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="feedback-message">Sua mensagem</Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Escreva aqui sua sugestão, relato de erro ou comentário..."
              rows={4}
              maxLength={1000}
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
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Enviando..." : "Enviar feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
