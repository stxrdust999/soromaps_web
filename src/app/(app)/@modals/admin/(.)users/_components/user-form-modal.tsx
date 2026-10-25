"use client";

import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MODAL_CLOSE_DELAY_MS } from "@/constants/users";
import type { adminGetUserResponse } from "@/http/users/users";

import { UserForm } from "./user-form";
import { UserFormSkeleton } from "./user-form-skeleton";

interface UserFormModalProps {
  promises: {
    userPromise: Promise<adminGetUserResponse>;
  };

  isUpdating?: boolean;
  userId?: string;
}

export function UserFormModal({
  promises,
  isUpdating = false,
  userId,
}: UserFormModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(true);

  function handleCloseModal() {
    setOpen(false);

    setTimeout(() => {
      router.back();
    }, MODAL_CLOSE_DELAY_MS);
  }

  const title = isUpdating ? "Editar usuário" : "Criar usuário";
  const description = isUpdating
    ? "Altere os campos abaixo para atualizar o usuário."
    : "Preencha os campos abaixo para criar um novo usuário.";

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleCloseModal()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Suspense fallback={<UserFormSkeleton />}>
          <UserForm
            promises={promises}
            isUpdating={isUpdating}
            userId={userId}
            onSuccess={handleCloseModal}
            onCancel={handleCloseModal}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}
