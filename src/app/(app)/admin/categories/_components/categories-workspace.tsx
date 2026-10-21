"use client";

import { PlusIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter } from "@/components/blocks/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CategoryFormSchema } from "@/validations/categories";

import { CategoriesTable } from "./categories-table";
import { CategoryFormDialog } from "./category-form-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { MapPreviewStrip } from "./map-preview-strip";
import type { CategoryRowActions } from "./row-action";
import { useCategories, type CategoryViewModel } from "./use-categories";

/**
 * Tela de categorias conectada com a API e Server Actions.
 */
export function CategoriesWorkspace() {
  const { categories, stats, save, duplicate, toggleActive, move, remove } =
    useCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryViewModel | null>(null);
  const [deleting, setDeleting] = useState<CategoryViewModel | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const actions = useMemo<CategoryRowActions>(
    () => ({
      onEdit: (category) => {
        setEditing(category);
        setFormOpen(true);
      },
      onDuplicate: duplicate,
      onToggleActive: toggleActive,
      onMove: move,
      onDelete: setDeleting,
    }),
    [duplicate, toggleActive, move],
  );

  async function handleSubmit(values: CategoryFormSchema) {
    const success = await save(values, editing?.id ?? null);
    if (success) {
      setFormOpen(false);
    }
  }

  async function handleDelete(targetId?: string) {
    if (!deleting) return;

    const success = await remove(deleting.id, targetId);
    if (success) {
      setDeleting(null);
    }
  }

  return (
    <main className="flex flex-1 flex-col">
      <PageSection
        title="Categorias"
        description="Catálogo que define ícone, cor e ordem dos pins no mapa"
        className="gap-6"
        actions={
          <Button onClick={openCreate}>
            <PlusIcon />
            Nova categoria
          </Button>
        }
        subitems={
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{stats.total} categorias</Badge>
            <Badge>{stats.ativas} ativas</Badge>
            <Badge>{stats.vazias} sem nenhum ponto</Badge>
            <Badge>
              {stats.pontos.toLocaleString("pt-BR")} pontos categorizados
            </Badge>
          </div>
        }
      >
        {categories.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 rounded-xl border px-6 py-22 text-center">
            <p className="font-heading font-semibold">
              Nenhuma categoria cadastrada
            </p>
            <p className="text-muted-foreground mb-2 text-sm">
              Sem categoria, todo ponto novo entra sem pin próprio no mapa.
            </p>

            <Button onClick={openCreate}>
              <PlusIcon />
              Nova categoria
            </Button>
          </div>
        ) : (
          <>
            <MapPreviewStrip categories={categories} />
            <CategoriesTable categories={categories} actions={actions} />
          </>
        )}
      </PageSection>

      <SiteFooter />

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
        categories={categories}
        onSubmit={handleSubmit}
      />

      {deleting && (
        <DeleteCategoryDialog
          open
          onOpenChange={(open) => !open && setDeleting(null)}
          category={deleting}
          categories={categories}
          onConfirm={handleDelete}
          onDeactivate={() => {
            toggleActive(deleting.id);
            setDeleting(null);
            toast.success(`Categoria desativada: ${deleting.nome}`);
          }}
        />
      )}
    </main>
  );
}
