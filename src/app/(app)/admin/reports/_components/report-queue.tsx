"use client";

import {
  CheckIcon,
  ClockIcon,
  FlagIcon,
  MapPinIcon,
  MessageSquareIcon,
  SearchIcon,
  ShapesIcon,
  StarIcon,
  TriangleAlertIcon,
  UserIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  REASON_LABEL,
  type ReportCaseMock,
  type ReportTargetKind,
  TARGET_LABEL,
} from "@/types/reports";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";

import { ReportSignalBadges } from "./report-signal-badges";
import { getReportSignals, tallyReasons } from "./use-reports";

/** Acima disso a idade do caso deixa de ser informação e vira alerta. */
const OVERDUE_DAYS = 7;

/** Contagem a partir da qual o caso merece destaque na lista. */
const HEAVY_REPORT_COUNT = 3;

const TARGET_ICON: Record<ReportTargetKind, typeof StarIcon> = {
  avaliacao: StarIcon,
  comentario: MessageSquareIcon,
  ponto: MapPinIcon,
  perfil: UserIcon,
};

const SENTINEL = "todos";

interface ReportQueueProps {
  reports: ReportCaseMock[];
  selectedId: string | null;
  filters: { texto: string; alvoTipo: string; motivo: string; sinal: string };
  hasFilters: boolean;
  onSelect: (id: string) => void;
  onFilterChange: (patch: {
    texto?: string;
    alvoTipo?: string;
    motivo?: string;
    sinal?: string;
  }) => void;
  onClearFilters: () => void;
}

/**
 * Coluna da esquerda: a fila de casos.
 *
 * **Lista alvos, não denúncias.** O item reportado cinco vezes é um caso, e
 * mostrar cinco linhas iguais faria o admin decidir a mesma coisa cinco vezes
 * — além de inflar artificialmente o tamanho da fila.
 */
export function ReportQueue({
  reports,
  selectedId,
  filters,
  hasFilters,
  onSelect,
  onFilterChange,
  onClearFilters,
}: ReportQueueProps) {
  return (
    <section className="flex h-full flex-col">
      <div className="flex shrink-0 flex-col gap-2.5 border-b p-3.5">
        <div className="relative">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            value={filters.texto}
            onChange={(event) => onFilterChange({ texto: event.target.value })}
            placeholder="Trecho ou local..."
            className="h-8 pl-8 text-xs"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={filters.alvoTipo || SENTINEL}
            onValueChange={(value) =>
              onFilterChange({ alvoTipo: value === SENTINEL ? "" : value })
            }
          >
            <SelectTrigger
              size="sm"
              className="flex-1 min-w-0"
              aria-label="Tipo de alvo"
            >
              <ShapesIcon className="size-3.5 shrink-0" />
              <SelectValue className="truncate" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value={SENTINEL}>Todos os alvos</SelectItem>
              {Object.entries(TARGET_LABEL).map(([value, { label }]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sinal || SENTINEL}
            onValueChange={(value) =>
              onFilterChange({ sinal: value === SENTINEL ? "" : value })
            }
          >
            <SelectTrigger
              size="sm"
              className="flex-1 min-w-0"
              aria-label="Sinal de risco"
            >
              <TriangleAlertIcon className="size-3.5 shrink-0" />
              <SelectValue className="truncate" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value={SENTINEL}>Qualquer sinal</SelectItem>
              <SelectItem value="coordenada">Denúncia coordenada</SelectItem>
              <SelectItem value="reincidente">Autor reincidente</SelectItem>
              <SelectItem value="divergente">Motivos divergentes</SelectItem>
              <SelectItem value="nenhum">Sem sinal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-xs truncate">
            {reports.length === 1 ? "1 caso" : `${reports.length} casos`} · mais
            denunciados primeiro
          </span>

          {hasFilters && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onClearFilters}
              className="text-muted-foreground shrink-0"
            >
              Limpar
            </Button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-2">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center px-7 py-16 text-center">
            <div className="bg-success/10 text-success flex size-10 items-center justify-center rounded-full">
              <CheckIcon size={20} />
            </div>

            <p className="mt-3.5 font-semibold">Nenhum caso aberto</p>
            <p className="text-muted-foreground mt-1 text-sm">
              A comunidade não sinalizou nada pendente.
            </p>
          </div>
        ) : (
          reports.map((report) => {
            const Icon = TARGET_ICON[report.alvoTipo];
            const signals = getReportSignals(report);
            const total = report.denunciantes.length;
            const overdue = report.diasAberto > OVERDUE_DAYS;

            return (
              <button
                key={report.id}
                type="button"
                onClick={() => onSelect(report.id)}
                className={cn(
                  "flex w-full flex-col gap-2 rounded-lg p-2.5 text-left transition-colors",
                  report.id === selectedId ? "bg-accent" : "hover:bg-accent/60",
                )}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="shrink-0">
                    <Icon size={12} />
                    <span className="text-xs font-light">
                      {TARGET_LABEL[report.alvoTipo].label}
                    </span>
                  </Badge>

                  <Badge
                    variant={
                      total >= HEAVY_REPORT_COUNT ? "destructive" : "outline"
                    }
                    className="tabular-nums shrink-0"
                  >
                    <FlagIcon size={12} />
                    <span className="text-xs font-light">
                      {total === 1 ? "1 denúncia" : `${total} denúncias`}
                    </span>
                  </Badge>

                  {overdue ? (
                    <Badge variant="warning" className="ml-auto shrink-0">
                      <ClockIcon size={12} />
                      <span className="text-xs font-light">
                        {formatWaitingDays(report.diasAberto)}
                      </span>
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground ml-auto text-xs whitespace-nowrap shrink-0">
                      {formatWaitingDays(report.diasAberto)}
                    </span>
                  )}
                </div>

                <p className="line-clamp-2 text-sm leading-snug">
                  {report.trecho}
                </p>

                <p className="text-muted-foreground text-[11.5px]">
                  {tallyReasons(report)
                    .map(
                      (tally) =>
                        `${tally.total}× ${REASON_LABEL[tally.motivo]}`,
                    )
                    .join(" · ")}
                </p>

                <ReportSignalBadges signals={signals} />
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
