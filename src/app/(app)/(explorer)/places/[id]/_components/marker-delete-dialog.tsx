"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deletePlaceAction } from "@/actions/places";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { responseToast } from "@/lib/toaster";

interface MarkerDeleteDialogProps {
  markerId: string | number;
  markerName: string;
}

/**
 * Confirmação de exclusão do local. Em caso de sucesso volta pro mapa.
 */
export function MarkerDeleteDialog({
  markerId,
  markerName,
}: MarkerDeleteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const state = await deletePlaceAction(String(markerId));

      if (!state.success) {
        responseToast.error({
          title: "Erro ao excluir local",
          description: state.message,
        });
        return;
      }

      responseToast.success({
        title: state.message,
        description: `${markerName} saiu do mapa.`,
      });

      setOpen(false);
      router.push("/home");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive">
          <Trash2Icon className="size-4" />
          Excluir
        </Button>
      </DialogTrigger>

      <DialogContent className="p-0 m-0" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold px-4 pt-4 pb-1">
            Excluir local
          </DialogTitle>

          <Separator />

          <DialogDescription className="px-4 pt-2 text-foreground">
            Tem certeza que deseja excluir este ponto? Esta ação é irreversível.
            Para confirmar, digite <strong>{markerName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="px-4">
          <Input placeholder={markerName} />
        </div>

        <Separator />

        <div className="flex flex-row justify-end gap-3 pb-4 px-4">
          <Button
            type="button"
            variant="default"
            className="bg-black hover:bg-black/75"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <Trash2Icon className="size-4" />
            )}
            Excluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
