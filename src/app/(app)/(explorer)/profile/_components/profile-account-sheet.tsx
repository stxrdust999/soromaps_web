"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCurrentUserAction, updateCurrentUserAction } from "@/actions/users";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { responseToast } from "@/lib/toaster";

interface ProfileAccountSheetProps {
  initialData: {
    name: string;
    email: string;
    neighborhood?: string | null;
    biography?: string | null;
  };
}

/**
 * Slide-over sheet for editing authenticated explorer profile and account termination.
 */
export function ProfileAccountSheet({ initialData }: ProfileAccountSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState<string>(initialData.name);
  const [neighborhood, setNeighborhood] = useState<string>(initialData.neighborhood ?? "");
  const [biography, setBiography] = useState<string>(initialData.biography ?? "");

  const handleUpdate = () => {
    if (!name.trim()) {
      responseToast.error({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome.",
      });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("neighborhood", neighborhood);
      formData.set("biography", biography);

      const state = await updateCurrentUserAction(formData);

      if (!state.success) {
        responseToast.error({
          title: "Erro ao atualizar perfil",
          description: state.message ?? "Não foi possível salvar as alterações.",
        });
        return;
      }

      responseToast.success({
        title: "Perfil atualizado",
        description: "Seus dados foram salvos com sucesso.",
      });

      setOpen(false);
      router.refresh();
    });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmationText.trim().toUpperCase() !== "EXCLUIR") {
      responseToast.error({
        title: "Confirmação necessária",
        description: "Digite EXCLUIR para confirmar a exclusão da conta.",
      });
      return;
    }

    startTransition(async () => {
      const state = await deleteCurrentUserAction();

      if (!state.success) {
        responseToast.error({
          title: "Erro ao excluir conta",
          description: state.message ?? "Não foi possível excluir sua conta.",
        });
        return;
      }

      responseToast.success({
        title: "Conta excluída",
        description: "Sua conta foi encerrada com sucesso.",
      });

      setDeleteDialogOpen(false);
      setDeleteConfirmationText("");
      setOpen(false);
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <PencilIcon className="size-4" />
            Editar perfil
          </Button>
        </SheetTrigger>

        <SheetContent className="flex flex-col gap-6 sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Editar Perfil</SheetTitle>
            <SheetDescription>
              Atualize as informações visíveis aos outros exploradores.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4">
            {/* name - field */}
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nome</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                placeholder="Seu nome completo"
              />
            </div>

            {/* email - field */}
            <div className="space-y-2">
              <Label htmlFor="profile-email">E-mail</Label>
              <Input
                id="profile-email"
                value={initialData.email}
                disabled
                className="bg-muted text-muted-foreground"
              />
            </div>

            {/* neighborhood - field */}
            <div className="space-y-2">
              <Label htmlFor="profile-neighborhood">Bairro</Label>
              <Input
                id="profile-neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                disabled={isPending}
                placeholder="Ex.: Campolim, Além Ponte..."
              />
            </div>

            {/* biography - field */}
            <div className="space-y-2">
              <Label htmlFor="profile-bio">Biografia</Label>
              <Textarea
                id="profile-bio"
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                disabled={isPending}
                placeholder="Conte um pouco sobre sua trajetória explorando Sorocaba..."
                rows={4}
              />
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <Button onClick={handleUpdate} disabled={isPending} className="w-full">
              {isPending ? "Salvando..." : "Salvar alterações"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full gap-2"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isPending}
            >
              <Trash2Icon className="size-4" />
              Excluir minha conta
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(isOpen) => {
          setDeleteDialogOpen(isOpen);
          if (!isOpen) setDeleteConfirmationText("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conta definitivamente?</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir sua conta permanentemente? Esta ação é irreversível.
            </DialogDescription>
          </DialogHeader>

          {/* delete-confirmation - field */}
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="delete-account-sheet-input" className="text-sm font-medium">
              Para prosseguir, digite <span className="font-bold text-destructive">EXCLUIR</span> abaixo:
            </Label>
            <Input
              id="delete-account-sheet-input"
              value={deleteConfirmationText}
              onChange={(event) => setDeleteConfirmationText(event.target.value)}
              placeholder="Digite EXCLUIR para confirmar"
              disabled={isPending}
              autoComplete="off"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmationText("");
              }}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isPending || deleteConfirmationText.trim().toUpperCase() !== "EXCLUIR"}
            >
              {isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
