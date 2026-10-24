import { BadgeCheckIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { explorerCredential } from "@/constants/explorer-titles";
import { isVerifiedExplorer } from "@/constants/verification";
import type { ExplorerView } from "@/types/community";

interface ExplorerCardProps {
  explorer: ExplorerView;
}

/**
 * Card de explorador na listagem da comunidade.
 */
export function ExplorerCard({ explorer }: ExplorerCardProps) {
  const verified = isVerifiedExplorer(explorer);

  return (
    <Card size="sm" className="card-interactive gap-3 border border-border">
      <CardContent className="flex flex-col gap-3">
        {/* identity - link */}
        <Link
          href={`/community/${explorer.id}`}
          className="flex items-center gap-3"
        >
          <Avatar className="size-11 shrink-0">
            {explorer.avatarUrl && (
              <AvatarImage src={explorer.avatarUrl} alt={explorer.nome} />
            )}
            <AvatarFallback className="text-xs">
              {explorer.iniciais}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-col">
            <span className="flex items-center gap-1 font-semibold text-sm">
              <span className="truncate">{explorer.nome}</span>
              {verified && (
                <BadgeCheckIcon
                  className="size-4 shrink-0 fill-sky-500 text-white"
                  aria-label="Explorador verificado"
                />
              )}
            </span>

            <span className="truncate text-muted-foreground text-xs">
              {explorerCredential(explorer.conquistas)}
            </span>
          </div>
        </Link>

        {/* location - metadata */}
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <MapPinIcon className="size-3.5" />
          {explorer.bairro}
          <span className="size-1 rounded-full bg-muted-foreground/30" />
          desde {explorer.desde}
        </div>

        {/* counters - footer */}
        <div className="flex gap-4 border-border border-t pt-3 text-xs">
          <span className="flex flex-col">
            <span className="font-semibold tabular-nums">
              {explorer.visitas}
            </span>
            <span className="text-muted-foreground">visitas</span>
          </span>

          <span className="flex flex-col">
            <span className="font-semibold tabular-nums">
              {explorer.avaliacoes}
            </span>
            <span className="text-muted-foreground">avaliações</span>
          </span>

          <span className="flex flex-col">
            <span className="font-semibold tabular-nums">
              {explorer.pontosCadastrados}
            </span>
            <span className="text-muted-foreground">pontos</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
