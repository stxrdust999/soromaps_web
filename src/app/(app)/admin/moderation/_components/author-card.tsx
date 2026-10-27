import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ModerationAuthorMock } from "@/types/moderation";

const TRUSTED_RATIO = 0.6;

interface AuthorCardProps {
  author: ModerationAuthorMock;
}

/**
 * Contexto do autor da sugestão ou da origem de sincronização externa na fila de moderação.
 */
export function AuthorCard({ author }: AuthorCardProps) {
  if (author.isExternalSync)
    return (
      <div className="flex flex-col gap-4 rounded-lg border p-4">
        {/* sync origin - header */}
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {author.iniciais}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="text-sm font-semibold">Sincronização Externa</p>
            <p className="text-muted-foreground text-xs">
              OpenStreetMap / Nominatim API
            </p>
          </div>
        </div>

        {/* sync origin - badge */}
        <Badge
          variant="outline"
          className="border-primary/30 bg-primary/10 text-primary w-fit"
        >
          Captura automatizada · Sem autor humano
        </Badge>

        {/* sync metadata - list */}
        <dl className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Meio de criação</dt>
            <dd>Sync via CLI / API externa</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Fonte dos dados</dt>
            <dd>{author.syncSource ?? "OpenStreetMap"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Requer curadoria</dt>
            <dd>Sim (validação de ficha)</dd>
          </div>
        </dl>

        <p className="text-muted-foreground text-xs">
          Pontos importados via sincronização não contabilizam conquistas nem
          possuem perfil de explorador vinculado.
        </p>
      </div>
    );

  const ratio = author.enviados > 0 ? author.aprovados / author.enviados : 0;
  const trusted = ratio >= TRUSTED_RATIO;

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      {/* identity - header */}
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback>{author.iniciais}</AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p className="text-sm font-semibold">{author.nome}</p>
          <p className="text-muted-foreground text-xs">{author.nivel}</p>
        </div>
      </div>

      {/* approval ratio - badge */}
      <div>
        <p className="text-muted-foreground mb-1 text-xs">Taxa de aprovação</p>
        <Badge variant={trusted ? "success" : "destructive"}>
          {author.aprovados} de {author.enviados} pontos aprovados
        </Badge>
      </div>

      {/* metadata - list */}
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

      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium"
      >
        Ver todos os pontos deste autor
        <ArrowRightIcon size={14} />
      </Link>
    </div>
  );
}
