import { BadgeCheckIcon, MessageSquareQuoteIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export interface VerifiedCommentAuthor {
  id?: string;
  nome: string;
  nivel: number;
  avatarUrl?: string;
}

interface VerifiedCommentCardProps {
  author: VerifiedCommentAuthor;
  comment: string;

  title?: string;
  className?: string;
}

/**
 * Comentário em destaque de um explorador verificado.
 *
 * O `max-w` existe porque o título é longo: sem ele, um container `w-fit`
 * estica para caber o título numa linha só.
 */
export function VerifiedCommentCard({
  author,
  comment,
  title = "Comentário de um explorador verificado",
  className,
}: VerifiedCommentCardProps) {
  return (
    <Card size="sm" className={className}>
      <CardContent className="flex max-w-64 flex-col gap-3">
        <div className="flex flex-row items-center gap-3">
          <span className="bg-sky-500 rounded-full p-2">
            <MessageSquareQuoteIcon size={16} className="text-white" />
          </span>
          <span className="text-balance font-semibold text-base">{title}</span>
        </div>

        <figure className="flex flex-col gap-3">
          <blockquote className="text-muted-foreground text-sm">
            “{comment}”
          </blockquote>

          <figcaption className="flex flex-row items-center gap-3">
            <Avatar identifier={author.id ?? author.nome}>
              {author.avatarUrl && (
                <AvatarImage src={author.avatarUrl} alt={author.nome} />
              )}
              <AvatarFallback>{author.nome.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <div className="flex flex-row items-center gap-1">
                <span className="font-semibold text-sm">{author.nome}</span>
                <BadgeCheckIcon size={16} className="text-white fill-sky-500" />
              </div>
              <span className="text-muted-foreground text-xs">
                Nível {author.nivel}
              </span>
            </div>
          </figcaption>
        </figure>
      </CardContent>
    </Card>
  );
}
