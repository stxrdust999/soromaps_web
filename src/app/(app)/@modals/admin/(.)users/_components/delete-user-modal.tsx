"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState, useTransition } from "react";

import { deleteUserAction } from "@/actions/users";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MODAL_CLOSE_DELAY_MS } from "@/constants/users";
import type { adminGetUserResponse } from "@/http/users/users";
import { responseToast } from "@/lib/toaster";

interface DeleteUserModalProps {
  promises: {
    userPromise: Promise<adminGetUserResponse>;
  };

  userId: string;
}

export function DeleteUserModal({ promises, userId }: DeleteUserModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(true);
  const [isPending, startTransition] = useTransition();

  const userResponse = use(promises.userPromise);
  const userName =
    userResponse.status === 200 ? userResponse.data.name : "este usuário";

  function handleCloseModal() {
    setOpen(false);

    setTimeout(() => {
      router.back();
    }, MODAL_CLOSE_DELAY_MS);
  }

  function handleDelete() {
    startTransition(async () => {
      const state = await deleteUserAction(userId);

      if (!state.success) {
        responseToast.error({
          title: "Erro ao excluir usuário",
          description: state.message ?? "Não foi possível excluir o usuário.",
        });
        return;
      }

      responseToast.success({
        title: state.message,
        description: `O usuário ${userName} foi removido do sistema.`,
      });

      handleCloseModal();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleCloseModal()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir usuário</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir <strong>{userName}</strong>? Esta
            ação é irreversível.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-row justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCloseModal}
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
