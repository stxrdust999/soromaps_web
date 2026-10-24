"use client";

import { useState } from "react";
import { toast } from "sonner";

import { undoModerationDecisionAction } from "@/actions/moderation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ModerationDecisionResponseDto } from "@/http/api.schemas";
import { listModerationHistory } from "@/http/moderation/moderation";
import type { ModerationDecisionMock } from "@/types/moderation";

type Decision = ModerationDecisionMock["decisao"];

const DECISION_VARIANT: Record<
  Decision,
  "success" | "destructive" | "secondary"
> = {
  aprovado: "success",
  rejeitado: "destructive",
  devolvido: "secondary",
};

const DECISION_LABEL: Record<Decision, string> = {
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  devolvido: "Devolvido",
};

/**
 * Converte um `ModerationDecisionResponseDto` para o modelo visual da tabela.
 */
export function mapDecisionDtoToView(
  dto: ModerationDecisionResponseDto,
): ModerationDecisionMock {
  const decisao: Decision =
    dto.decision === 2
      ? "aprovado"
      : dto.decision === 3
        ? "rejeitado"
        : "devolvido";
  const diffHours =
    (Date.now() - new Date(dto.createdAt).getTime()) / (1000 * 60 * 60);

  return {
    id: dto.id,
    placeId: dto.placeId,
    nome: dto.placeName,
    bairro: dto.neighborhood || "Sorocaba",
    categoria: dto.categoryName || "Local",
    decisao,
    motivo: dto.reason ?? dto.feedbackNote ?? null,
    moderador: dto.moderator?.name ?? "Admin",
    quando: new Date(dto.createdAt).toLocaleDateString("pt-BR"),
    podeDesfazer: diffHours <= 24,
  };
}

interface HistoryTableProps {
  initialHistory: ModerationDecisionMock[];
}

/**
 * Trilha de auditoria das decisões recentes de moderação conectada à API.
 */
export function HistoryTable({ initialHistory }: HistoryTableProps) {
  const [history, setHistory] =
    useState<ModerationDecisionMock[]>(initialHistory);

  const reload = async () => {
    try {
      const response = await listModerationHistory({ Page: 1, PageSize: 50 });
      if (response.status === 200 && response.data.items) {
        setHistory(response.data.items.map(mapDecisionDtoToView));
      }
    } catch (error) {
      console.error("Erro ao carregar histórico de moderação:", error);
    }
  };

  const handleUndo = async (decision: ModerationDecisionMock) => {
    const result = await undoModerationDecisionAction(decision.placeId);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success("Decisão desfeita com sucesso.");
    await reload();
  };

  return (
    <div className="flex flex-col gap-3.5 px-8 pb-9">
      {/* history - table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ponto</TableHead>
            <TableHead className="w-36">Decisão</TableHead>
            <TableHead className="w-52">Motivo</TableHead>
            <TableHead className="w-44">Moderador</TableHead>
            <TableHead className="w-40">Quando</TableHead>
            <TableHead className="w-28" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {history.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-12 text-center text-muted-foreground text-sm"
              >
                Nenhuma decisão registrada recentemente.
              </TableCell>
            </TableRow>
          ) : (
            history.map((decision) => (
              <TableRow key={decision.id}>
                <TableCell>
                  <p className="font-medium">{decision.nome}</p>
                  <p className="text-muted-foreground text-xs">
                    {decision.bairro}
                  </p>
                </TableCell>

                <TableCell>
                  <Badge variant={DECISION_VARIANT[decision.decisao]}>
                    {DECISION_LABEL[decision.decisao]}
                  </Badge>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {decision.motivo ?? "—"}
                </TableCell>

                <TableCell>{decision.moderador}</TableCell>

                <TableCell className="text-muted-foreground tabular-nums">
                  {decision.quando}
                </TableCell>

                <TableCell className="text-right">
                  {decision.podeDesfazer ? (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleUndo(decision)}
                    >
                      Desfazer
                    </Button>
                  ) : (
                    <span className="text-muted-foreground/70 text-xs">
                      prazo esgotado
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <p className="text-muted-foreground px-1 text-xs">
        Decisões dos últimos 7 dias · “Desfazer” fica disponível por 24 h após a
        decisão.
      </p>
    </div>
  );
}
