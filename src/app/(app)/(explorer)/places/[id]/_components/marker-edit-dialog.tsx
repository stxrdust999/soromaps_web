"use client";

import { PencilIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { MarkerResource } from "@/types/marker";
import { MarkerEditForm } from "./marker-edit-form";

interface MarkerEditDialogProps {
  marker: MarkerResource;
}

/**
 * Diálogo modal para edição do local pelo autor ou administrador.
 */
export function MarkerEditDialog({ marker }: MarkerEditDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PencilIcon className="size-4" />
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar local</DialogTitle>
          <DialogDescription>
            Atualize o nome e as informações do local.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <MarkerEditForm marker={marker} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
