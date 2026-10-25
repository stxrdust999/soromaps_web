import { MapPinIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { MarkerResource } from "@/types/marker";

interface PlaceRowProps {
  marker: Partial<MarkerResource> & Pick<MarkerResource, "id" | "nome">;
  trailing?: ReactNode;
  position?: number;
  className?: string;
}

/**
 * Linha compacta de local com miniatura, categoria, bairro e informação lateral à direita.
 */
export function PlaceRow({
  marker,
  trailing,
  position,
  className,
}: PlaceRowProps) {
  const fotoUrl = marker.coverPhotoUrl ?? null;
  const categoria = marker.category?.name ?? "Local";
  const bairro = marker.neighborhood ?? "Sorocaba";

  return (
    <Link
      href={`/places/${marker.id}`}
      className={cn(
        "card-interactive flex items-center gap-3 rounded-xl border border-border bg-card p-2 pr-3",
        className,
      )}
    >
      {position !== undefined && (
        <span className="w-5 shrink-0 text-center font-bold text-lg text-muted-foreground/50">
          {position}
        </span>
      )}

      {/* thumbnail - section */}
      <div
        className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg"
        style={{
          backgroundColor: fotoUrl ? undefined : marker.category?.color ? `${marker.category.color}20` : undefined,
        }}
      >
        {fotoUrl ? (
          <Image
            src={fotoUrl}
            alt={`Foto de ${marker.nome}`}
            fill
            sizes="44px"
            className="object-cover"
          />
        ) : (
          <div
            className="flex size-full items-center justify-center rounded-lg border border-border/40"
            style={{
              backgroundColor: marker.category?.color ? `${marker.category.color}25` : undefined,
              color: marker.category?.color ?? "currentColor",
            }}
          >
            <MapPinIcon className="size-5" aria-hidden />
          </div>
        )}
      </div>

      {/* details - section */}
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-semibold text-sm">{marker.nome}</span>
        <span className="truncate text-muted-foreground text-xs">
          {categoria} · {bairro}
        </span>
      </div>

      {trailing && (
        <span className="ml-auto shrink-0 pl-2 text-sm">{trailing}</span>
      )}
    </Link>
  );
}
