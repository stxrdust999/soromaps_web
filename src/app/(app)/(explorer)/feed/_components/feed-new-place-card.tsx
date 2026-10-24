"use client";

import { MapIcon, MapPinPlusIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { FeedNewPlaceItem } from "@/types/feed";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";

import { FeedPlaceLink, FeedSaveButton } from "./feed-actions";
import { FeedCardFrame, type FeedCardHandlers } from "./feed-card-frame";
import { FeedEventIcon } from "./feed-event-icon";
import type { FeedMute } from "./use-feed";

interface FeedNewPlaceCardProps {
  item: FeedNewPlaceItem;
  mutes: FeedMute[];
  handlers: FeedCardHandlers;
}

/**
 * Ponto novo aprovado no mapa exibido no feed.
 */
export function FeedNewPlaceCard({
  item,
  mutes,
  handlers,
}: FeedNewPlaceCardProps) {
  return (
    <FeedCardFrame
      leading={
        <FeedEventIcon
          icon={MapPinPlusIcon}
          className="bg-sky-500/15 text-sky-600 dark:text-sky-400"
        />
      }
      reason={item.motivo}
      reasonDetail={item.motivoDetalhe}
      mutes={mutes}
      onMute={handlers.onMute}
      title={
        <span>
          <Link
            href={`/places/${item.local.id}`}
            className="font-semibold hover:underline"
          >
            {item.local.nome}
          </Link>{" "}
          <span className="text-muted-foreground">entrou no mapa</span>
        </span>
      }
      meta={`${item.local.categoria} · ${item.local.bairro} · cadastrado por ${item.autor.nome} · ${formatWaitingDays(item.diasAtras)}`}
      footer={
        <>
          <FeedSaveButton
            saved={handlers.isSaved(item.local.id)}
            onToggle={() => handlers.onSave(item.local.id)}
          />
          <FeedPlaceLink placeId={item.local.id} />
          <Button asChild size="sm" variant="ghost">
            <Link href="/home">
              <MapIcon />
              Ver no mapa
            </Link>
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
          <Image
            src={item.local.fotoUrl}
            alt={`Foto de ${item.local.nome}`}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>

        <p className="text-pretty text-sm leading-relaxed">{item.sobre}</p>
      </div>
    </FeedCardFrame>
  );
}
