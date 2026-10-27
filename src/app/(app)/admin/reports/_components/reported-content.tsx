import { ImageIcon, MapPinIcon } from "lucide-react";
import { StarRating } from "@/components/blocks/star-rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ReportCaseMock, ReportedAuthorMock } from "@/types/reports";

interface ReportedContentProps {
  report: ReportCaseMock;
  author: ReportedAuthorMock;
}

/**
 * Renderiza o snapshot do conteúdo denunciado adaptado à natureza do alvo
 * (avaliação, comentário, ponto de interesse ou perfil).
 */
export function ReportedContent({ report, author }: ReportedContentProps) {
  const { conteudo } = report;

  if (report.alvoTipo === "avaliacao") {
    return (
      /* review target - section */
      <article className="bg-card flex flex-col gap-3 rounded-xl border p-4">
        <header className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>{author.iniciais}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{author.nome}</p>
            <p className="text-muted-foreground text-xs">{author.titulo}</p>
          </div>

          <StarRating nota={conteudo.nota ?? 0} showValue />
        </header>

        <p className="text-sm leading-relaxed text-pretty">{conteudo.corpo}</p>

        <footer className="flex items-center gap-2 border-t pt-3">
          <MapPinIcon size={13} className="text-muted-foreground" />
          <span className="text-xs font-medium">{conteudo.local}</span>
          {conteudo.bairro && (
            <span className="text-muted-foreground text-xs">
              · {conteudo.bairro}
            </span>
          )}
          <span className="text-muted-foreground ml-auto text-xs">
            {conteudo.data}
          </span>
        </footer>
      </article>
    );
  }

  if (report.alvoTipo === "comentario") {
    return (
      /* comment target - section */
      <article className="bg-card flex flex-col gap-4 rounded-xl border p-4">
        <div className="flex flex-col gap-2.5">
          <header className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarFallback>{author.iniciais}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{author.nome}</p>
              <p className="text-muted-foreground text-xs">{author.titulo}</p>
            </div>

            <span className="text-muted-foreground text-xs">
              {conteudo.data}
            </span>
          </header>

          <p className="text-sm leading-relaxed text-pretty">
            {conteudo.corpo}
          </p>
        </div>

        {/* parent review context - section */}
        {conteudo.avaliacaoMae && (
          <div className="ml-1.5 flex flex-col gap-2 border-l-2 py-0.5 pl-3.5">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
              Em resposta à avaliação
            </span>

            {(conteudo.avaliacaoMae.autor ||
              conteudo.avaliacaoMae.nota > 0 ||
              conteudo.local) && (
              <div className="flex items-center gap-2">
                {conteudo.avaliacaoMae.autor && (
                  <span className="text-xs font-semibold">
                    {conteudo.avaliacaoMae.autor}
                  </span>
                )}
                {conteudo.avaliacaoMae.nota > 0 && (
                  <StarRating nota={conteudo.avaliacaoMae.nota} size={11} />
                )}
                {conteudo.local && (
                  <span className="text-muted-foreground text-xs">
                    {conteudo.avaliacaoMae.autor ||
                    conteudo.avaliacaoMae.nota > 0
                      ? `· ${conteudo.local}`
                      : conteudo.local}
                  </span>
                )}
              </div>
            )}

            <p className="text-muted-foreground text-sm leading-relaxed">
              {conteudo.avaliacaoMae.corpo}
            </p>
          </div>
        )}
      </article>
    );
  }

  if (report.alvoTipo === "ponto") {
    return (
      /* place target - section */
      <article className="bg-card overflow-hidden rounded-xl border">
        {conteudo.fotoNome && (
          <div className="bg-muted text-muted-foreground flex h-38 items-center justify-center gap-2 font-mono text-xs">
            <ImageIcon size={18} />
            <span>{conteudo.fotoNome}</span>
          </div>
        )}

        <div className="flex flex-col gap-2 p-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-semibold">{report.alvoNome}</span>
            {conteudo.categoria && (
              <Badge variant="secondary">{conteudo.categoria}</Badge>
            )}
          </div>

          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
            <MapPinIcon size={13} />
            <span>{conteudo.bairro}</span>
            {conteudo.coordenadas && (
              <span className="ml-1 font-mono">{conteudo.coordenadas}</span>
            )}
          </div>

          <p className="text-sm leading-relaxed">{conteudo.corpo}</p>
        </div>
      </article>
    );
  }

  return (
    /* profile target - section */
    <article className="bg-card flex gap-4 rounded-xl border p-4">
      <Avatar className="size-14">
        <AvatarFallback className="text-lg">{author.iniciais}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div>
          <p className="font-semibold">{author.nome}</p>
          <p className="text-muted-foreground text-xs">{author.titulo}</p>
        </div>

        <p className="text-sm leading-relaxed">{conteudo.corpo}</p>

        {conteudo.contadores && conteudo.contadores.length > 0 && (
          <dl className="flex gap-5 pt-1">
            {conteudo.contadores.map((contador) => (
              <div key={contador.rotulo}>
                <dt className="sr-only">{contador.rotulo}</dt>
                <dd className="font-semibold tabular-nums">{contador.valor}</dd>
                <p className="text-muted-foreground text-[11.5px]">
                  {contador.rotulo}
                </p>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}
