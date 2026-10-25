import { MapPinIcon, NavigationIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { placeTagColor } from "@/constants/places";
import { cn } from "@/lib/utils";
import type { MarkerResource } from "@/types/marker";

type PlaceCardSize = "sm" | "md" | "featured";

interface PlaceCardProps {
  marker: Partial<MarkerResource> & Pick<MarkerResource, "id" | "nome">;
  size?: PlaceCardSize;
  showTags?: boolean;
  badge?: ReactNode;
  className?: string;
}

const FRAME: Record<PlaceCardSize, string> = {
  sm: "w-44 flex-none",
  md: "w-60 flex-none",
  featured: "w-full",
};

const PHOTO: Record<PlaceCardSize, string> = {
  sm: "h-28",
  md: "h-40",
  featured: "h-52",
};

const SIZES: Record<PlaceCardSize, string> = {
  sm: "176px",
  md: "240px",
  featured: "(min-width: 1024px) 360px, 100vw",
};

/**
 * Card de local utilizado nas trilhas de descoberta, favoritos e destaques.
 * Exibe foto de capa, nota média, bairro, categoria e tags reais do local.
 */
export function PlaceCard({
  marker,
  size = "md",
  showTags = false,
  badge,
  className,
}: PlaceCardProps) {
  const isSmall = size === "sm";
  const isFeatured = size === "featured";

  const fotoUrl = marker.coverPhotoUrl ?? null;
  const nota =
    marker.ratingAverage !== undefined && marker.ratingAverage > 0
      ? marker.ratingAverage.toFixed(1)
      : "—";
  const categoria = marker.category?.name ?? "Local";
  const bairro = marker.neighborhood ?? "Sorocaba";
  const sobre = marker.about ?? "";
  const totalAvaliacoes = marker.reviewsCount ?? 0;
  const tags = marker.tags?.map((tag) => tag.name) ?? [];
  const distanceLabel =
    marker.distanceKm !== undefined ? `${marker.distanceKm}km` : bairro;

  return (
    <Link
      href={`/places/${marker.id}`}
      className={cn(
        "card-interactive group flex flex-col overflow-hidden rounded-2xl border border-border bg-card",
        FRAME[size],
        className,
      )}
    >
      {/* cover photo - section */}
      <div
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden bg-muted",
          PHOTO[size],
        )}
      >
        {fotoUrl ? (
          <Image
            src={fotoUrl}
            alt={`Foto de ${marker.nome}`}
            fill
            sizes={SIZES[size]}
            className={cn(
              "object-cover",
              isFeatured &&
                "transition-transform duration-500 group-hover:scale-105",
            )}
          />
        ) : (
          <MapPinIcon className="size-8 text-muted-foreground/40" aria-hidden />
        )}

        {badge && <div className="absolute top-2 left-2">{badge}</div>}

        <Badge className="absolute right-2 bottom-2 bg-black/75 text-white">
          <StarIcon className="size-3 fill-yellow-500 text-yellow-500" />
          {nota}
        </Badge>
      </div>

      {/* metadata - section */}
      <div className="flex flex-col gap-1 p-3">
        <span
          className={cn(
            "truncate font-semibold",
            isFeatured ? "text-base" : "text-sm",
          )}
        >
          {marker.nome}
        </span>

        <span className="truncate text-muted-foreground text-xs">
          {isSmall
            ? `${categoria} · ${distanceLabel}`
            : `${categoria} · ${bairro}`}
        </span>

        {isFeatured && sobre && (
          <p className="mt-1 line-clamp-2 text-pretty text-muted-foreground text-xs leading-relaxed">
            {sobre}
          </p>
        )}

        {showTags && tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                className={cn(
                  "font-semibold text-[10px] uppercase tracking-wide",
                  placeTagColor(tag),
                )}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {!isSmall && (
          <div className="mt-1 flex items-center gap-1.5 text-muted-foreground text-xs">
            {marker.distanceKm !== undefined && (
              <>
                <NavigationIcon className="size-3 shrink-0 text-blue-500" />
                {marker.distanceKm}km
                <span className="size-1 shrink-0 rounded-full bg-muted-foreground/30" />
              </>
            )}
            {totalAvaliacoes} avaliações
          </div>
        )}
      </div>
    </Link>
  );
}
