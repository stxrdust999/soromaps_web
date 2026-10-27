"use client";

import {
  BugIcon,
  HeartIcon,
  LightbulbIcon,
  Loader2Icon,
  MessageSquareIcon,
  MessageSquarePlusIcon,
  SendIcon,
  SparklesIcon,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const FEEDBACK_CATEGORIES = [
  {
    value: "1",
    label: "Sugestão",
    description: "Ideias e melhorias",
    icon: LightbulbIcon,
    selectedClasses:
      "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500/40",
    iconColor: "text-amber-500",
  },
  {
    value: "0",
    label: "Problema / Bug",
    description: "Relatar falha ou erro",
    icon: BugIcon,
    selectedClasses:
      "border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500/40",
    iconColor: "text-rose-500",
  },
  {
    value: "2",
    label: "Elogio",
    description: "Conte o que gostou",
    icon: HeartIcon,
    selectedClasses:
      "border-pink-500 bg-pink-500/10 text-pink-900 dark:text-pink-200 ring-1 ring-pink-500/40",
    iconColor: "text-pink-500",
  },
  {
    value: "3",
    label: "Outro",
    description: "Dúvidas ou recados",
    icon: MessageSquareIcon,
    selectedClasses:
      "border-sky-500 bg-sky-500/10 text-sky-900 dark:text-sky-200 ring-1 ring-sky-500/40",
    iconColor: "text-sky-500",
  },
] as const;

interface FeedbackDialogProps {
  trigger?: ReactNode;
}

/**
 * Modal visual aprimorado para envio de sugestões, elogios e relatos de erros com cards temáticos.
 */
export function FeedbackDialog({ trigger }: FeedbackDialogProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState<boolean>(false);
  const [category, setCategory] = useState<string>("1");
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
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
        setCategory("1");
        return;
      }

      toast.error(response.message);
    });
  };

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
        <DialogHeader className="gap-2 pb-1">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SparklesIcon className="size-5" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-base font-semibold leading-tight">
                Enviar feedback
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Ajude a moldar o Soromaps com suas ideias, relatos ou elogios.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* category-selection - section */}
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Categoria
            </Label>
            <div className="grid grid-cols-2 gap-2.5">
              {FEEDBACK_CATEGORIES.map((categoryOption) => {
                const isSelected = category === categoryOption.value;
                const IconComponent = categoryOption.icon;
                return (
                  <button
                    key={categoryOption.value}
                    type="button"
                    onClick={() => setCategory(categoryOption.value)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? categoryOption.selectedClasses
                        : "border-border bg-card text-card-foreground",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent
                        className={cn(
                          "size-4",
                          isSelected ? "" : categoryOption.iconColor,
                        )}
                      />
                      <span className="font-semibold text-xs">
                        {categoryOption.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground line-clamp-1">
                      {categoryOption.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* message - field */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="feedback-message"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Sua mensagem
            </Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Escreva sua sugestão detalhada, erro encontrado ou comentário..."
              rows={4}
              maxLength={1000}
              className="resize-none text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
              <span>Seja o mais específico possível.</span>
              <span
                className={cn(
                  message.length >= 950 ? "font-semibold text-destructive" : "",
                )}
              >
                {message.length}/1000
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
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
            onClick={handleSubmit}
            disabled={isPending || !message.trim()}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <SendIcon className="size-3.5" />
                Enviar feedback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
