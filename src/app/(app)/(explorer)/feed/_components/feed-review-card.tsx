"use client";

import Image from "next/image";
import Link from "next/link";

import { StarRating } from "@/components/blocks/star-rating";
import type { FeedReviewItem } from "@/types/feed";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";

import {
  FeedPlaceLink,
  FeedSaveButton,
  FeedUsefulButton,
} from "./feed-actions";
import { FeedAuthorAvatar, FeedAuthorName } from "./feed-author";
import { FeedCardFrame, type FeedCardHandlers } from "./feed-card-frame";
import type { FeedMute } from "./use-feed";

interface FeedReviewCardProps {
  item: FeedReviewItem;
  mutes: FeedMute[];
  handlers: FeedCardHandlers;
}

/**
 * Avaliação de explorador exibida no feed.
 */
export function FeedReviewCard({ item, mutes, handlers }: FeedReviewCardProps) {
  return (
    <FeedCardFrame
      leading={<FeedAuthorAvatar author={item.autor} />}
      reason={item.motivo}
      reasonDetail={item.motivoDetalhe}
      mutes={mutes}
      onMute={handlers.onMute}
      title={
        <FeedAuthorName
          author={item.autor}
          action={
            <span className="text-muted-foreground">
              avaliou{" "}
              <Link
                href={`/places/${item.local.id}`}
                className="font-medium text-foreground hover:underline"
              >
                {item.local.nome}
              </Link>
            </span>
          }
        />
      }
      meta={`${item.local.categoria} · ${item.local.bairro} · ${formatWaitingDays(item.diasAtras)}, ${item.hora}`}
      footer={
        <>
          <FeedUsefulButton
            count={item.uteis}
            marked={handlers.isUseful(item.reviewId)}
            onToggle={() => handlers.onUseful(item.reviewId, item.local.id)}
          />
          <FeedSaveButton
            saved={handlers.isSaved(item.local.id)}
            onToggle={() => handlers.onSave(item.local.id)}
          />
          <FeedPlaceLink placeId={item.local.id} />
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <StarRating nota={item.nota} showValue />

        <p className="text-pretty text-sm leading-relaxed">{item.corpo}</p>

        {item.fotoUrl && (
          <div className="relative mt-1 h-56 w-full overflow-hidden rounded-xl bg-muted">
            <Image
              src={item.fotoUrl}
              alt={`Foto de ${item.local.nome} enviada na avaliação`}
              fill
              sizes="(min-width: 1280px) 640px, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </FeedCardFrame>
  );
}
