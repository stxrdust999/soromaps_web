"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageSection } from "@/components/blocks/page-section";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { getAdminDashboardStatsResponse } from "@/http/admin-dashboard/admin-dashboard";
import type { listCategoriesResponse } from "@/http/categories/categories";
import type {
  listModerationHistoryResponse,
  listModerationPlacesResponse,
} from "@/http/moderation/moderation";
import { cn } from "@/lib/utils";
import type {
  ModerationDecisionMock,
  ModerationItemMock,
  ModerationStatus,
} from "@/types/moderation";

import { DuplicateDialog } from "./duplicate-dialog";
import { HistoryTable, mapDecisionDtoToView } from "./history-table";
import { ModerationStats } from "./moderation-stats";
import { PointReview } from "./point-review";
import { QueuePanel } from "./queue-panel";
import { RejectDialog } from "./reject-dialog";
import { ReturnDialog } from "./return-dialog";
import {
  mapDtoToItemMock,
  useModerationQueue,
} from "./use-moderation-queue";

type WorkspaceTab = "fila" | "historico";
type OpenDialog = "rejeicao" | "duplicata" | "devolucao" | null;

const TABS: { value: WorkspaceTab; label: string }[] = [
  { value: "fila", label: "Fila" },
  { value: "historico", label: "Histórico" },
];

interface ModerationWorkspaceProps {
  promises: {
    queuePromise: Promise<listModerationPlacesResponse>;
    historyPromise: Promise<listModerationHistoryResponse>;
    categoriesPromise: Promise<listCategoriesResponse>;
    statsPromise: Promise<getAdminDashboardStatsResponse>;
  };
}

/**
 * Área de trabalho de moderação integrada à API via Streaming SSR (`use()` + `useMemo()`).
 */
export function ModerationWorkspace({ promises }: ModerationWorkspaceProps) {
  const queueResponse = use(promises.queuePromise);
  const historyResponse = use(promises.historyPromise);
  const categoriesResponse = use(promises.categoriesPromise);
  const statsResponse = use(promises.statsPromise);

  const initialQueueItems = useMemo<ModerationItemMock[]>(() => {
    if (queueResponse.status === 200 && queueResponse.data.items)
      return queueResponse.data.items.map(mapDtoToItemMock);
    return [];
  }, [queueResponse]);

  const initialHistory = useMemo<ModerationDecisionMock[]>(() => {
    if (historyResponse.status === 200 && historyResponse.data.items)
      return historyResponse.data.items.map(mapDecisionDtoToView);
    return [];
  }, [historyResponse]);

  const categoryNames = useMemo<string[]>(() => {
    if (categoriesResponse.status === 200 && categoriesResponse.data.items)
      return categoriesResponse.data.items.map((category) => category.name);
    return [];
  }, [categoriesResponse]);

  const summaryStats = useMemo(() => {
    const todayString = new Date().toLocaleDateString("pt-BR");
    const decididosHoje = initialHistory.filter(
      (decision) => decision.quando === todayString,
    ).length;
    const avgHours =
      statsResponse.status === 200
        ? Number(statsResponse.data.kpis?.averageModerationTimeHours ?? 0)
        : 0;
    const tempoMedio =
      avgHours >= 24
        ? `${Math.floor(avgHours / 24)}d ${Math.round(avgHours % 24)}h`
        : `${Math.max(1, Math.round(avgHours))}h`;

    return { decididosHoje, tempoMedio };
  }, [initialHistory, statsResponse]);

  const queue = useModerationQueue(initialQueueItems);
  const [tab, setTab] = useState<WorkspaceTab>("fila");
  const [dialog, setDialog] = useState<OpenDialog>(null);

  const { decide, decideMarked, undo, selected } = queue;

  const announce = useCallback(
    (message: string) => {
      toast.success(message, {
        action: { label: "Desfazer", onClick: undo },
      });
    },
    [undo],
  );

  const runDecision = useCallback(
    (
      status: ModerationStatus,
      verb: string,
      reason?: string | null,
      feedbackNote?: string | null,
    ) => {
      const item = decide(status, reason, feedbackNote);
      if (item) announce(`${verb}: ${item.nome}`);
    },
    [decide, announce],
  );

  const runBulkDecision = useCallback(
    (status: ModerationStatus, verb: string) => {
      const count = decideMarked(status);
      if (count)
        announce(`${count} ${count === 1 ? "ponto" : "pontos"} ${verb}`);
    },
    [decideMarked, announce],
  );

  useEffect(() => {
    if (tab !== "fila" || dialog) return;

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      switch (event.key.toLowerCase()) {
        case "a":
          event.preventDefault();
          runDecision("aprovado", "Ponto aprovado");
          break;
        case "d":
          event.preventDefault();
          if (selected) setDialog("devolucao");
          break;
        case "r":
          event.preventDefault();
          if (selected) setDialog("rejeicao");
          break;
        case "j":
          event.preventDefault();
          queue.moveSelection(1);
          break;
        case "k":
          event.preventDefault();
          queue.moveSelection(-1);
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tab, dialog, selected, runDecision, queue.moveSelection]);

  return (
    <>
      {/* header - section */}
      <PageSection
        title="Moderação"
        description="Fila de aprovação de pontos enviados pela comunidade"
        className="flex-none px-8 py-7"
        actions={
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
        }
        subitems={
          <ModerationStats
            pendingCount={queue.pendingCount}
            returnedCount={queue.returnedCount}
            decididosHoje={summaryStats.decididosHoje}
            tempoMedio={summaryStats.tempoMedio}
          />
        }
      />

      {/* workspace - panels */}
      {tab === "fila" ? (
        <ResizablePanelGroup
          orientation="horizontal"
          className="min-h-0 flex-1 border-t"
        >
          <ResizablePanel
            defaultSize={28}
            minSize={24}
            maxSize={45}
            className="min-w-[340px]"
          >
            <QueuePanel
              items={queue.visible}
              categories={categoryNames}
              tempoMedio={summaryStats.tempoMedio}
              selectedId={queue.selectedId}
              markedIds={queue.markedIds}
              filters={queue.filters}
              onSelect={queue.setSelectedId}
              onToggleMark={queue.toggleMark}
              onFilterChange={queue.updateFilters}
              onClearMarks={queue.clearMarks}
              onApproveMarked={() => runBulkDecision("aprovado", "aprovados")}
              onRejectMarked={() => runBulkDecision("rejeitado", "rejeitados")}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel minSize={30} className="min-w-[480px]">
            <section className="flex h-full min-w-0 flex-col">
              {selected ? (
                <PointReview
                  item={selected}
                  author={selected.autor}
                  onApprove={() => runDecision("aprovado", "Ponto aprovado")}
                  onReturn={() => setDialog("devolucao")}
                  onReject={() => setDialog("rejeicao")}
                  onCompare={() => setDialog("duplicata")}
                />
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-1.5 p-12 text-center">
                  <p className="font-semibold">Nada para revisar</p>
                  <p className="text-muted-foreground text-sm">
                    Toda a fila foi decidida. Tempo médio nesta semana:{" "}
                    {summaryStats.tempoMedio}.
                  </p>
                </div>
              )}
            </section>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto border-t pt-4">
          <HistoryTable initialHistory={initialHistory} />
        </div>
      )}

      {selected && (
        <ReturnDialog
          open={dialog === "devolucao"}
          onOpenChange={(open) => setDialog(open ? "devolucao" : null)}
          pointName={selected.nome}
          onConfirm={(reason, note) => {
            setDialog(null);
            runDecision(
              "devolvido",
              "Devolvido ao autor",
              reason,
              note,
            );
          }}
        />
      )}

      {selected && (
        <RejectDialog
          open={dialog === "rejeicao"}
          onOpenChange={(open) => setDialog(open ? "rejeicao" : null)}
          pointName={selected.nome}
          onConfirm={(reason, note) => {
            setDialog(null);
            runDecision(
              "rejeitado",
              `Ponto rejeitado (${reason})`,
              reason,
              note ?? null,
            );
          }}
        />
      )}

      {selected?.duplicata && (
        <DuplicateDialog
          open={dialog === "duplicata"}
          onOpenChange={(open) => setDialog(open ? "duplicata" : null)}
          pointName={selected.nome}
          duplicate={selected.duplicata}
          onMerge={() => {
            setDialog(null);
            runDecision(
              "rejeitado",
              `Mesclado em ${selected.duplicata?.nome ?? "ponto existente"}`,
              "Duplicata",
            );
          }}
          onKeepBoth={() => {
            setDialog(null);
            toast.info("Marcado como lugar diferente");
          }}
        />
      )}
    </>
  );
}
