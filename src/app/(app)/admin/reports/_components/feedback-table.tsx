"use client";

import { CircleDotIcon, SearchIcon, ShapesIcon, UserIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { ColumnVisibilityFilter } from "@/components/table/column-visibility-filter";
import {
  SelectFilterChip,
  type SelectFilterChipOption,
  TextFilterChip,
} from "@/components/table/filter-chip";
import { FilterChipsScrollArea } from "@/components/table/filter-chips-scroll-area";
import { FilterResetButton } from "@/components/table/filter-reset-button";
import { RowCommon } from "@/components/table/row-common";
import { TableEmptyState } from "@/components/table/table-empty-state";
import { TableFooter } from "@/components/table/table-footer";
import { TableHeaderTemplate } from "@/components/table/table-header-template";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { useTableConfig } from "@/hooks/table/use-table-config";
import type { FeedbackMock } from "@/types/reports";
import { hasActiveFilters } from "@/utils/table/has-active-filters";

import {
  createFeedbackColumns,
  type FeedbackRowActions,
  feedbackColumnsNames,
} from "./columns-feedback";

const KIND_OPTIONS: SelectFilterChipOption[] = [
  { value: "bug", label: "Bug" },
  { value: "sugestao", label: "Sugestão" },
  { value: "elogio", label: "Elogio" },
];

const STATUS_OPTIONS: SelectFilterChipOption[] = [
  { value: "novo", label: "Novo" },
  { value: "lido", label: "Lido" },
  { value: "respondido", label: "Respondido" },
];

const AUTHORSHIP_OPTIONS: SelectFilterChipOption[] = [
  { value: "identificado", label: "Identificado" },
  { value: "anonimo", label: "Anônimo" },
];

interface FeedbackTableProps {
  feedback: FeedbackMock[];
  onMarkRead: FeedbackRowActions["onMarkRead"];
  onMarkAnswered: FeedbackRowActions["onMarkAnswered"];
}

/**
 * Triagem de feedback — listagem simples, não mestre-detalhe.
 *
 * Diferente das denúncias, aqui o trabalho é ler e classificar: a mensagem
 * expande na própria linha e o desfecho é um status, não uma decisão sobre
 * conteúdo de terceiro.
 */
export function FeedbackTable({
  feedback,
  onMarkRead,
  onMarkAnswered,
}: FeedbackTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>("f1");

  const onToggleExpand = useCallback(
    (id: string) => setExpandedId((current) => (current === id ? null : id)),
    [],
  );

  const columns = useMemo(
    () =>
      createFeedbackColumns({
        expandedId,
        onToggleExpand,
        onMarkRead,
        onMarkAnswered,
      }),
    [expandedId, onToggleExpand, onMarkRead, onMarkAnswered],
  );

  const config = useTableConfig({
    data: feedback,
    columns,
    defaultSorting: [{ id: "diasRecebido", desc: false }],
    perPage: 10,
    getRowId: (row) => row.id,
  });

  const activeFilters = hasActiveFilters({ table: config.table });

  const mensagemColumn = config.table.getColumn("mensagem");
  const tipoColumn = config.table.getColumn("tipo");
  const statusColumn = config.table.getColumn("status");
  const autorColumn = config.table.getColumn("autor");

  return (
    <section className="flex flex-col gap-4 px-8 pb-9">
      <div className="flex items-start justify-between gap-3">
        <FilterChipsScrollArea>
          {mensagemColumn && (
            <TextFilterChip
              table={config.table}
              column={mensagemColumn}
              icon={<SearchIcon className="size-4" />}
              label={feedbackColumnsNames.mensagem}
              placeholder="Palavra na mensagem..."
            />
          )}

          {tipoColumn && (
            <SelectFilterChip
              table={config.table}
              column={tipoColumn}
              icon={<ShapesIcon className="size-4" />}
              label={feedbackColumnsNames.tipo}
              options={KIND_OPTIONS}
              menuLabel="Sobre o quê"
            />
          )}

          {statusColumn && (
            <SelectFilterChip
              table={config.table}
              column={statusColumn}
              icon={<CircleDotIcon className="size-4" />}
              label={feedbackColumnsNames.status}
              options={STATUS_OPTIONS}
              menuLabel="Triagem"
            />
          )}

          {autorColumn && (
            <SelectFilterChip
              table={config.table}
              column={autorColumn}
              icon={<UserIcon className="size-4" />}
              label="Autoria"
              options={AUTHORSHIP_OPTIONS}
              menuLabel="Quem enviou"
            />
          )}
        </FilterChipsScrollArea>

        {activeFilters && (
          <FilterResetButton
            action={() => {
              config.table.resetColumnFilters();
              config.table.resetSorting();
            }}
          />
        )}

        <ColumnVisibilityFilter table={config.table} />
      </div>

      <div className="bg-background">
        <Table>
          <TableHeader>
            <TableHeaderTemplate header={config.header} />
          </TableHeader>

          <TableBody>
            {config.rows.length ? (
              config.rows.map((row) => <RowCommon key={row.id} row={row} />)
            ) : (
              <TableEmptyState
                columns={columns}
                message="Nenhum feedback encontrado com esses filtros."
              />
            )}
          </TableBody>
        </Table>
      </div>

      <TableFooter table={config.table} hiddenSelectedRows />

      <p className="text-muted-foreground text-xs">
        Envio anônimo aceito: o canal recebe mais, mas linha anônima não tem
        para onde responder — só classificar. Resposta a quem se identificou sai
        por fora do app nesta versão.
      </p>
    </section>
  );
}
