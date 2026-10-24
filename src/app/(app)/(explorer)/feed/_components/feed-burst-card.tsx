"use client";

import { FlameIcon, FootprintsIcon } from "lucide-react";
import Link from "next/link";

import { StarRating } from "@/components/blocks/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { FeedBurstItem } from "@/types/feed";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";

import { FeedPlaceLink, FeedSaveButton } from "./feed-actions";
import { FeedCardFrame, type FeedCardHandlers } from "./feed-card-frame";
import { FeedEventIcon } from "./feed-event-icon";
import type { FeedMute } from "./use-feed";

const FACES_LIMIT = 4;

interface FeedBurstCardProps {
  item: FeedBurstItem;
  mutes: FeedMute[];
  handlers: FeedCardHandlers;
}

/**
 * Rajada de atividade num local agregada no feed.
 */
export function FeedBurstCard({ item, mutes, handlers }: FeedBurstCardProps) {
  const isReviews = item.tipo === "avaliacoes";
  const faces = item.participantes.slice(0, FACES_LIMIT);
  const rest = item.total - faces.length;

  return (
    <FeedCardFrame
      leading={
        <FeedEventIcon
          icon={isReviews ? FlameIcon : FootprintsIcon}
          className={
            isReviews
              ? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          }
        />
      }
      reason={item.motivo}
      reasonDetail={item.motivoDetalhe}
      mutes={mutes}
      onMute={handlers.onMute}
      title={
        <span>
          <span className="font-semibold">{item.total} pessoas</span>{" "}
          {isReviews ? "avaliaram" : "visitaram"}{" "}
          <Link
            href={`/places/${item.local.id}`}
            className="font-semibold hover:underline"
          >
            {item.local.nome}
          </Link>{" "}
          <span className="text-muted-foreground">{item.janela}</span>
        </span>
      }
      meta={`${item.local.categoria} · ${item.local.bairro} · ${formatWaitingDays(item.diasAtras)}`}
      footer={
        <>
          <FeedSaveButton
            saved={handlers.isSaved(item.local.id)}
            onToggle={() => handlers.onSave(item.local.id)}
          />
          <FeedPlaceLink
            placeId={item.local.id}
            label={isReviews ? "Ler as avaliações" : "Ver local"}
          />
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex -space-x-2">
          {faces.map((person) => (
            <Avatar
              key={person.nome}
              className="size-7 ring-2 ring-card"
              title={person.nome}
            >
              {person.avatarUrl && (
                <AvatarImage src={person.avatarUrl} alt={person.nome} />
              )}
              <AvatarFallback className="text-[10px]">
                {person.iniciais}
              </AvatarFallback>
            </Avatar>
          ))}

          {rest > 0 && (
            <span className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium ring-2 ring-card">
              +{rest}
            </span>
          )}
        </div>

        {item.notaMedia !== undefined ? (
          <span className="flex items-center gap-2 text-muted-foreground text-xs">
            <StarRating nota={Math.round(item.notaMedia)} size={12} />
            média{" "}
            {item.notaMedia.toLocaleString("pt-BR", {
              minimumFractionDigits: 1,
            })}{" "}
            na janela
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">
            visitas registradas por quem estava lá
          </span>
        )}
      </div>
    </FeedCardFrame>
  );
}
