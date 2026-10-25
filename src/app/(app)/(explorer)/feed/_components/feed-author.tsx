import { BadgeCheckIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { explorerCredential } from "@/constants/explorer-titles";
import { cn } from "@/lib/utils";
import type { FeedAuthorMock } from "@/types/feed";

interface FeedAuthorAvatarProps {
  author: FeedAuthorMock;
  className?: string;
}

/**
 * Avatar do autor no feed, com iniciais como fallback.
 */
export function FeedAuthorAvatar({ author, className }: FeedAuthorAvatarProps) {
  return (
    <Avatar
      className={cn("size-10 shrink-0", className)}
      identifier={author.id ?? author.nome}
    >
      {author.avatarUrl && (
        <AvatarImage src={author.avatarUrl} alt={author.nome} />
      )}
      <AvatarFallback className="text-xs">{author.iniciais}</AvatarFallback>
    </Avatar>
  );
}

interface FeedAuthorNameProps {
  author: FeedAuthorMock;
  action?: ReactNode;
}

/**
 * Nome do autor com selo de verificado e credencial de explorador.
 */
export function FeedAuthorName({ author, action }: FeedAuthorNameProps) {
  return (
    <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
      <span className="inline-flex items-center gap-1 font-semibold">
        {author.nome}
        {author.verificado && (
          <BadgeCheckIcon
            className="size-3.5 fill-sky-500 text-white"
            aria-label="Explorador verificado"
          />
        )}
      </span>

      <span className="text-muted-foreground text-xs">
        {explorerCredential(author.conquistas)}
      </span>

      {action}
    </span>
  );
}
