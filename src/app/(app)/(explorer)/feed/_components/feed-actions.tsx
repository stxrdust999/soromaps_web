"use client";

import { HeartIcon, MapPinIcon, ThumbsUpIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeedPlaceLinkProps {
  placeId: string;
  label?: string;
}

/**
 * Link direto para o detalhe de um local a partir de um card do feed.
 */
export function FeedPlaceLink({
  placeId,
  label = "Ver local",
}: FeedPlaceLinkProps) {
  return (
    <Button asChild size="sm" variant="ghost">
      <Link href={`/places/${placeId}`}>
        <MapPinIcon />
        {label}
      </Link>
    </Button>
  );
}

interface FeedSaveButtonProps {
  saved: boolean;
  onToggle: () => void;
}

/**
 * Botão para acompanhar/favoritar um local no feed.
 */
export function FeedSaveButton({ saved, onToggle }: FeedSaveButtonProps) {
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={onToggle}
      aria-pressed={saved}
      className={cn(saved && "text-rose-600 dark:text-rose-400")}
    >
      <HeartIcon className={cn(saved && "fill-current")} />
      {saved ? "Acompanhando" : "Acompanhar lugar"}
    </Button>
  );
}

interface FeedUsefulButtonProps {
  count: number;
  marked: boolean;
  onToggle: () => void;
}

/**
 * Botão de reação de utilidade em avaliações do feed.
 */
export function FeedUsefulButton({
  count,
  marked,
  onToggle,
}: FeedUsefulButtonProps) {
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={onToggle}
      aria-pressed={marked}
      className={cn(marked && "text-primary")}
    >
      <ThumbsUpIcon className={cn(marked && "fill-current")} />
      Útil
      <span className="tabular-nums">{count + (marked ? 1 : 0)}</span>
    </Button>
  );
}
