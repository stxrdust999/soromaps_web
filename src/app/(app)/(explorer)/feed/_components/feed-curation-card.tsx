"use client";

import { BookOpenIcon, NewspaperIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FeedCurationItem } from "@/types/feed";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";

import { FeedCardFrame, type FeedCardHandlers } from "./feed-card-frame";
import { FeedEventIcon } from "./feed-event-icon";
import type { FeedMute } from "./use-feed";

interface FeedCurationCardProps {
  item: FeedCurationItem;
  mutes: FeedMute[];
  handlers: FeedCardHandlers;
}

/**
 * Roteiro/pauta editorial exibido no feed.
 */
export function FeedCurationCard({
  item,
  mutes,
  handlers,
}: FeedCurationCardProps) {
  return (
    <FeedCardFrame
      leading={
        <FeedEventIcon
          icon={NewspaperIcon}
          className="bg-teal-500/15 text-teal-600 dark:text-teal-400"
        />
      }
      reason={item.motivo}
      reasonDetail={item.motivoDetalhe}
      mutes={mutes}
      onMute={handlers.onMute}
      title={
        <Link
          href={`/pautas/${item.slug}`}
          className="font-semibold text-base hover:underline"
        >
          {item.titulo}
        </Link>
      }
      meta={`Por ${item.editor} · ${item.locais.length} lugares · ${formatWaitingDays(item.diasAtras)}`}
      footer={
        <div className="flex flex-wrap items-center gap-1.5">
          <Button asChild size="sm" variant="ghost">
            <Link href={`/pautas/${item.slug}`}>
              <BookOpenIcon />
              Ler a pauta
            </Link>
          </Button>

          {item.locais.map((local) => (
            <Badge key={local.id} variant="outline" asChild>
              <Link href={`/places/${local.id}`}>
                {local.nome}
                <span className="text-muted-foreground">· {local.bairro}</span>
              </Link>
            </Badge>
          ))}
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <Link
          href={`/pautas/${item.slug}`}
          className="relative h-44 w-full overflow-hidden rounded-xl bg-muted"
        >
          <Image
            src={item.fotoUrl}
            alt={item.titulo}
            fill
            sizes="(min-width: 1280px) 640px, 100vw"
            className="object-cover"
          />
        </Link>

        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          {item.chamada}
        </p>
      </div>
    </FeedCardFrame>
  );
}
