"use client";

import { EyeOffIcon, MoreHorizontalIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FeedReason } from "@/constants/feed";

import { FeedReasonBadge } from "./feed-reason-badge";
import type { FeedMute } from "./use-feed";

export interface FeedCardHandlers {
  onMute: (rule: FeedMute) => void;
  isSaved: (placeId: string) => boolean;
  onSave: (placeId: string) => void;
  isUseful: (reviewId: string) => boolean;
  onUseful: (reviewId: string, placeId: string) => void;
}

interface FeedCardFrameProps {
  leading: ReactNode;
  title: ReactNode;
  meta: ReactNode;
  reason: FeedReason;
  reasonDetail?: string;
  mutes: FeedMute[];
  onMute: (rule: FeedMute) => void;
  children?: ReactNode;
  footer?: ReactNode;
}

/**
 * Moldura comum dos itens do feed: cabeçalho com autor/evento, selo de motivo,
 * menu de ajuste e rodapé de ações.
 */
export function FeedCardFrame({
  leading,
  title,
  meta,
  reason,
  reasonDetail,
  mutes,
  onMute,
  children,
  footer,
}: FeedCardFrameProps) {
  return (
    <Card size="sm" className="gap-3">
      {/* header - metadata */}
      <CardHeader className="flex flex-row items-start gap-3">
        {leading}

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 text-sm leading-snug">{title}</div>

            <div className="flex shrink-0 items-center gap-1">
              <FeedReasonBadge
                reason={reason}
                detail={reasonDetail}
                className="hidden sm:inline-flex"
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    aria-label="Ajustar o que aparece no feed"
                  >
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>Ver menos disso</DropdownMenuLabel>

                  {mutes.map((rule) => (
                    <DropdownMenuItem
                      key={`${rule.scope}-${rule.value}`}
                      onSelect={() => onMute(rule)}
                    >
                      <EyeOffIcon />
                      {rule.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <span className="truncate text-muted-foreground text-xs">{meta}</span>

          <FeedReasonBadge
            reason={reason}
            detail={reasonDetail}
            className="mt-1 sm:hidden"
          />
        </div>
      </CardHeader>

      {/* body - content */}
      {children && <CardContent className="pl-17">{children}</CardContent>}

      {/* actions - footer */}
      {footer && (
        <CardFooter className="flex-wrap gap-1 pl-17 text-muted-foreground">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
