"use client";

import { useState } from "react";
import {
  CheckIcon,
  CornerUpLeftIcon,
  ImageOffIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MODERATION_STATUS_LABEL,
  type ModerationAuthorMock,
  type ModerationItemMock,
} from "@/types/moderation";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";

import { AuthorCard } from "./author-card";
import { NeighborhoodMap } from "./neighborhood-map";
import { PointFields } from "./point-fields";

const SHORTCUTS = [
  { keys: ["A"], label: "aprovar" },
  { keys: ["D"], label: "devolver" },
  { keys: ["R"], label: "rejeitar" },
  { keys: ["J", "K"], label: "navegar" },
];

interface PointReviewProps {
  item: ModerationItemMock;
  author: ModerationAuthorMock;
  onApprove: () => void;
  onReturn: () => void;
  onReject: () => void;
  onCompare: () => void;
}

/**
 * Painel da direita: tudo que sustenta a decisão de moderação e os controles de ação.
 */
export function PointReview({
  item,
  author,
  onApprove,
  onReturn,
  onReject,
  onCompare,
}: PointReviewProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const activePhotoUrl = item.photoUrls?.[selectedPhotoIndex] ?? item.photoUrls?.[0];
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-auto px-8 pt-7 pb-9">
        {/* header - summary */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-muted-foreground text-sm">
              {item.categoria} · {item.bairro} · enviado{" "}
              {formatWaitingDays(item.diasNaFila)}
            </p>
            <h2 className="font-heading text-2xl font-medium tracking-tight">
              {item.nome}
            </h2>
          </div>

          <Badge variant="secondary" className="shrink-0">
            {MODERATION_STATUS_LABEL[item.status]}
          </Badge>
        </div>

        {/* duplicate alert - banner */}
        {item.duplicata && (
          <div className="border-warning/40 bg-warning/10 text-warning flex items-center gap-3.5 rounded-lg border p-3">
            <TriangleAlertIcon size={16} className="shrink-0" />

            <p className="text-sm">
              Possível duplicata: <strong>{item.duplicata.nome}</strong> fica a{" "}
              <strong>{item.duplicata.distanciaMetros} m</strong> daqui e tem
              nome <strong>{item.duplicata.similaridadeNome}%</strong> similar.
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={onCompare}
              className="ml-auto shrink-0"
            >
              Comparar lado a lado
            </Button>
          </div>
        )}

        {/* media and map - grid */}
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-2.5">
            <span className="text-muted-foreground text-sm">Foto enviada</span>

            {item.fotos > 0 ? (
              <>
                <div className="bg-muted text-muted-foreground flex h-53 items-center justify-center rounded-lg font-mono text-xs overflow-hidden">
                  {activePhotoUrl ? (
                    <img
                      src={activePhotoUrl}
                      alt={item.nome}
                      className="size-full object-cover"
                    />
                  ) : (
                    `${item.id}-01.jpg · 1600×1200`
                  )}
                </div>

                {item.photoUrls && item.photoUrls.length > 1 && (
                  <div className="flex gap-2">
                    {item.photoUrls.map((url, index) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setSelectedPhotoIndex(index)}
                        className={`overflow-hidden size-13 rounded-md border-2 transition-all ${
                          selectedPhotoIndex === index
                            ? "border-primary"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={url}
                          alt={`${item.nome} - miniatura ${index + 1}`}
                          className="size-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-muted-foreground flex h-53 flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
                <ImageOffIcon size={20} />
                <span className="text-sm">Nenhuma foto enviada</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground text-sm">
                Vizinhança · raio de 200 m
              </span>
              <span className="text-muted-foreground font-mono text-xs">
                {item.campos.coordenadas}
              </span>
            </div>

            <div className="relative h-53 overflow-hidden rounded-lg border">
              <NeighborhoodMap neighbors={item.vizinhos} />

              <div className="text-muted-foreground absolute bottom-2.5 left-2.5 flex items-center gap-2.5 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="bg-primary size-1.5 rounded-full" />
                  em análise
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="bg-muted-foreground/60 size-1.5 rounded-full" />
                  já aprovados
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* fields and author - grid */}
        <div className="grid items-start gap-6 lg:grid-cols-[1.45fr_1fr]">
          <PointFields campos={item.campos} />
          <AuthorCard author={author} />
        </div>
      </div>

      {/* actions - footer */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-t px-8 py-3.5">
        <Button onClick={onApprove}>
          <CheckIcon />
          Aprovar
        </Button>

        <Button variant="outline" onClick={onReturn}>
          <CornerUpLeftIcon />
          Devolver para o autor
        </Button>

        <Button variant="ghost" onClick={onReject}>
          Rejeitar
        </Button>

        <div className="text-muted-foreground ml-auto flex items-center gap-3 text-xs">
          {SHORTCUTS.map((shortcut) => (
            <span key={shortcut.label} className="flex items-center gap-1.5">
              {shortcut.keys.map((key) => (
                <kbd
                  key={key}
                  className="rounded-sm border px-1.5 py-0.5 font-mono text-[10px]"
                >
                  {key}
                </kbd>
              ))}
              {shortcut.label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
