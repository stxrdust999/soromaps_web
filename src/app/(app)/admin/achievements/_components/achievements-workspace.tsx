"use client";

import { AwardIcon, PlusIcon, TriangleAlertIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter } from "@/components/blocks/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ACHIEVEMENT_EVENTS } from "@/constants/achievements";
import type { listAchievementsResponse } from "@/http/achievements/achievements";
import type { listCategoriesResponse } from "@/http/categories/categories";
import type { listPlacesResponse } from "@/http/places/places";
import { cn } from "@/lib/utils";
import type { AchievementMock } from "@/types/achievements";
import type { AchievementFormSchema } from "@/validations/achievements";

import { AchievementFormDialog } from "./achievement-form-dialog";
import { AchievementsTable } from "./achievements-table";
import { BadgeStrip } from "./badge-strip";
import { CalibrationPanel } from "./calibration-panel";
import type { AchievementRowActions } from "./columns";
import { DeactivateDialog } from "./deactivate-dialog";
import {
  UnlockPreviewDialog,
  type UnlockPreviewSubject,
} from "./unlock-preview-dialog";
import { triggerOf, useAchievements } from "./use-achievements";

type WorkspaceTab = "catalogo" | "calibragem";

const TABS: { value: WorkspaceTab; label: string }[] = [
  { value: "catalogo", label: "Catálogo" },
  { value: "calibragem", label: "Calibragem" },
];

interface AchievementsWorkspaceProps {
  achievementsPromise: Promise<listAchievementsResponse>;
  categoriesPromise: Promise<listCategoriesResponse>;
  placesPromise: Promise<listPlacesResponse>;
}

/**
 * Workspace administrativo de conquistas. Desempacota as Promises da API com `React.use()` via `useAchievements`
 * e coordena catálogo, calibragem e diálogos de criação/edição.
 */
export function AchievementsWorkspace({
  achievementsPromise,
  categoriesPromise,
  placesPromise,
}: AchievementsWorkspaceProps) {
  const {
    achievements,
    categories,
    neighborhoods,
    stats,
    calibration,
    save,
    duplicate,
    setActive,
  } = useAchievements({
    achievementsPromise,
    categoriesPromise,
    placesPromise,
  });


  const [tab, setTab] = useState<WorkspaceTab>("catalogo");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AchievementMock | null>(null);
  const [deactivating, setDeactivating] = useState<AchievementMock | null>(
    null,
  );
  const [preview, setPreview] = useState<UnlockPreviewSubject | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const previewFromAchievement = useCallback(
    (achievement: AchievementMock) =>
      setPreview({
        id: achievement.id,
        nome: achievement.nome,
        descricao: achievement.descricao,
        icone: achievement.icone,
        cor: achievement.cor,
        trigger: triggerOf(achievement),
        obtencoes: achievement.obtencoes,
        raridade: achievement.raridade,
      }),
    [],
  );

  const actions = useMemo<AchievementRowActions>(
    () => ({
      onEdit: (achievement) => {
        setEditing(achievement);
        setFormOpen(true);
      },
      onDuplicate: async (id) => {
        await duplicate(id);
        toast.success("Conquista duplicada", {
          description: "A cópia nasce inativa — ajuste o critério antes.",
        });
      },
      onPreview: previewFromAchievement,
      onDeactivate: setDeactivating,
      onActivate: async (achievement) => {
        await setActive(achievement.id, true);
        toast.success(`Conquista ativada: ${achievement.nome}`);
      },
    }),
    [duplicate, setActive, previewFromAchievement],
  );

  async function handleSubmit(values: AchievementFormSchema) {
    const success = await save(values, editing?.id ?? null);
    if (success) {
      setFormOpen(false);
      toast.success(editing ? "Conquista salva" : "Conquista criada");
    }
  }

  return (
    <main className="flex flex-1 flex-col">
      <PageSection
        title="Conquistas"
        description="Catálogo que define quais conquistas existem no app"
        className="gap-6"
        actions={
          <div className="flex items-center gap-3">
            <div className="bg-muted flex items-center gap-0.5 rounded-lg p-0.5">
              {TABS.map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant="ghost"
                  onClick={() => setTab(option.value)}
                  className={cn(
                    "text-muted-foreground",
                    tab === option.value &&
                      "bg-background text-foreground shadow-xs hover:bg-background",
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <Button onClick={openCreate}>
              <PlusIcon />
              Nova conquista
            </Button>
          </div>
        }
        subitems={
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{stats.total} conquistas</Badge>
            <Badge>{stats.ativas} ativas</Badge>

            {stats.zeradas > 0 && (
              <Badge variant="warning">
                <TriangleAlertIcon size={12} />
                <span className="text-xs font-light">
                  {stats.zeradas} que ninguém tirou
                </span>
              </Badge>
            )}

            <Badge>
              {stats.concedidas.toLocaleString("pt-BR")} conquistas concedidas
            </Badge>
          </div>
        }
      >
        {achievements.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 rounded-xl border px-6 py-22 text-center">
            <div className="bg-muted text-muted-foreground mb-2 flex size-11 items-center justify-center rounded-full">
              <AwardIcon size={20} />
            </div>

            <p className="font-heading font-semibold">
              Nenhuma conquista cadastrada
            </p>
            <p className="text-muted-foreground mb-2 text-sm">
              Sem conquistas, a aba de gamificação do app fica vazia para todo
              mundo.
            </p>

            <Button onClick={openCreate}>
              <PlusIcon />
              Nova conquista
            </Button>
          </div>
        ) : tab === "catalogo" ? (
          <>
            <BadgeStrip achievements={achievements} onSelect={actions.onEdit} />
            <AchievementsTable achievements={achievements} actions={actions} />
          </>
        ) : (
          <CalibrationPanel
            mostEarned={calibration.mostEarned}
            leastEarned={calibration.leastEarned}
            emptyCount={stats.zeradas}
          />
        )}
      </PageSection>

      <SiteFooter />

      <AchievementFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        achievement={editing}
        categories={categories}
        neighborhoods={neighborhoods}
        onSubmit={handleSubmit}
        onPreviewUnlock={(values) =>
          setPreview({
            id: editing?.id ?? "preview",
            nome: values.nome || "Nova conquista",
            descricao: values.descricao || "Descrição que o jogador lê no app",
            icone: values.icone,
            cor: values.cor,
            trigger: ACHIEVEMENT_EVENTS[values.evento].trigger,
            obtencoes: editing?.obtencoes ?? 0,
            raridade: editing?.raridade ?? 0,
          })
        }
      />

      {preview && (
        <UnlockPreviewDialog
          subject={preview}
          onOpenChange={(open) => !open && setPreview(null)}
        />
      )}

      {deactivating && (
        <DeactivateDialog
          achievement={deactivating}
          onOpenChange={(open) => !open && setDeactivating(null)}
          onConfirm={() => {
            setActive(deactivating.id, false);
            setDeactivating(null);

            toast.success(`Conquista desativada: ${deactivating.nome}`, {
              description: "Quem já ganhou mantém no perfil.",
            });
          }}
        />
      )}
    </main>
  );
}
