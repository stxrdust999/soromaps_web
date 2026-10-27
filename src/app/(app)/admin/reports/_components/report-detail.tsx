"use client";

import { OctagonAlertIcon, ShieldOffIcon, Trash2Icon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  REASON_LABEL,
  type ReportCaseMock,
  TARGET_LABEL,
} from "@/types/reports";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";
import { ReportSignalBadges } from "./report-signal-badges";
import { ReportedContent } from "./reported-content";
import { getReportSignals, isNewAccount, tallyReasons } from "./use-reports";

/** Cor da barra por motivo — só distingue as fatias, não classifica gravidade. */
const REASON_COLOR: Record<string, string> = {
  spam: "#ea580c",
  ofensa: "#e40016",
  falsa: "#7c3aed",
  improprio: "#db2777",
  escopo: "#475569",
};

interface ReportDetailProps {
  report: ReportCaseMock;
  onDiscard: () => void;
  onRemove: () => void;
}

/**
 * Painel de detalhes do caso de denúncia agrupado com contexto do conteúdo,
 * lista de denunciantes, histórico do autor e ações de decisão.
 */
export function ReportDetail({
  report,
  onDiscard,
  onRemove,
}: ReportDetailProps) {
  const author = report.autor;
  const signals = getReportSignals(report);
  const tallies = tallyReasons(report);

  const total = report.denunciantes.length;
  const newAccounts = report.denunciantes.filter((reporter) =>
    isNewAccount(reporter.diasDeConta),
  ).length;

  const coordinated = signals.some((signal) => signal.kind === "coordenada");
  const divergent = signals.some((signal) => signal.kind === "divergente");

  const targetLabel = TARGET_LABEL[report.alvoTipo];
  const title =
    report.alvoNome ??
    `${targetLabel.label} em ${report.conteudo.local ?? "local não informado"}`;

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-auto px-8 pt-6 pb-8">
        {/* case header - section */}
        <header className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm">
            {targetLabel.label} · {targetLabel.participio}{" "}
            {total === 1 ? "1 vez" : `${total} vezes`} · aberto{" "}
            {formatWaitingDays(report.diasAberto)}
          </p>

          <h2 className="font-heading text-2xl font-medium tracking-tight">
            {title}
          </h2>

          <ReportSignalBadges signals={signals} />
        </header>

        {/* coordinated alert - section */}
        {coordinated && (
          <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-3.5 rounded-lg border p-3">
            <OctagonAlertIcon size={16} className="shrink-0" />

            <p className="text-sm">
              As {total} denúncias vêm de contas criadas nos últimos dias, todas
              com o mesmo motivo. Isso é briga organizada, não a comunidade
              sinalizando.
            </p>
          </div>
        )}

        {/* reported content - section */}
        <section className="flex flex-col gap-2.5">
          <span className="text-muted-foreground text-sm">
            Conteúdo denunciado, como o usuário vê
          </span>

          <ReportedContent report={report} author={author} />
        </section>

        {/* reporters list - section */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-muted-foreground text-sm">
              Quem denunciou ·{" "}
              {total === 1 ? "1 denúncia" : `${total} denúncias`}
            </span>

            <span
              className={cn(
                "text-xs",
                coordinated
                  ? "text-destructive font-semibold"
                  : "text-muted-foreground",
              )}
            >
              {coordinated
                ? `${newAccounts} de ${total} são contas de poucos dias`
                : divergent
                  ? "Os denunciantes não concordam no motivo"
                  : "Contas estabelecidas"}
            </span>
          </div>

          <ul className="divide-y overflow-hidden rounded-lg border">
            {report.denunciantes.map((reporter, index) => (
              <li
                key={`${reporter.nome}-${index}`}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5",
                  index % 2 === 1 && "bg-muted/40",
                )}
              >
                <Avatar className="size-7">
                  <AvatarFallback className="text-[11px]">
                    {reporter.iniciais}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{reporter.nome}</p>
                  <p
                    className={cn(
                      "text-[11.5px]",
                      isNewAccount(reporter.diasDeConta)
                        ? "text-destructive font-semibold"
                        : "text-muted-foreground",
                    )}
                  >
                    {isNewAccount(reporter.diasDeConta)
                      ? `conta criada há ${reporter.diasDeConta} ${reporter.diasDeConta === 1 ? "dia" : "dias"}`
                      : reporter.membroDesde?.toLowerCase().startsWith("membro")
                        ? reporter.membroDesde
                        : `membro desde ${reporter.membroDesde ?? "recente"}`}
                  </p>
                </div>

                <Badge variant="secondary">
                  {REASON_LABEL[reporter.motivo]}
                </Badge>

                <span className="text-muted-foreground w-22 text-right text-xs whitespace-nowrap">
                  {reporter.quando}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid items-start gap-5 lg:grid-cols-2">
          {/* author summary - section */}
          <section className="flex flex-col gap-3.5 rounded-lg border p-4">
            <span className="text-muted-foreground text-sm">
              Autor do conteúdo
            </span>

            <div className="flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback>{author.iniciais}</AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="text-sm font-semibold">{author.nome}</p>
                <p className="text-muted-foreground text-xs">{author.titulo}</p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-1 text-xs">
                Histórico de moderação
              </p>

              <Badge
                variant={author.conteudoRemovido > 0 ? "warning" : "success"}
                className="font-semibold"
              >
                {author.conteudoRemovido === 0
                  ? "Nenhum conteúdo removido antes"
                  : `Conteúdo removido antes: ${author.conteudoRemovido} ${author.conteudoRemovido === 1 ? "vez" : "vezes"}`}
              </Badge>
            </div>

            <dl className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Membro desde</dt>
                <dd>{author.membroDesde}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Avaliações escritas</dt>
                <dd className="tabular-nums">{author.avaliacoesEscritas}</dd>
              </div>
            </dl>
          </section>

          {/* aggregated reasons - section */}
          <section className="flex flex-col gap-3 rounded-lg border p-4">
            <span className="text-muted-foreground text-sm">
              Motivos agregados
            </span>

            <ul className="flex flex-col gap-2.5">
              {tallies.map((tally) => (
                <li key={tally.motivo} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm">
                      {REASON_LABEL[tally.motivo]}
                    </span>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {tally.total}×
                    </span>
                  </div>

                  <div className="bg-muted h-1 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${tally.fracao}%`,
                        backgroundColor: REASON_COLOR[tally.motivo],
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <p className="text-muted-foreground text-xs leading-relaxed">
              {tallies.length === 1
                ? "Todos apontam o mesmo motivo — sinal consistente."
                : "Motivos divergentes costumam indicar desavença pessoal, não problema no conteúdo."}
            </p>
          </section>
        </div>
      </div>

      {/* decision actions - section */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-t px-8 py-3.5">
        <Button variant="outline" onClick={onDiscard}>
          <ShieldOffIcon />
          Descartar denúncias
        </Button>

        <Button variant="destructive" onClick={onRemove}>
          <Trash2Icon />
          Remover conteúdo
        </Button>

        <p className="text-muted-foreground ml-auto max-w-80 text-xs">
          Ambas encerram o caso. Punição de conta não faz parte desta versão.
        </p>
      </div>
    </>
  );
}
