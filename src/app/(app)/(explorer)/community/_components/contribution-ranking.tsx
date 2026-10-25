"use client";

import { TrophyIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { explorerTitle } from "@/constants/explorer-titles";
import { cn } from "@/lib/utils";
import { type ExplorerView, totalContributions } from "@/types/community";

const TOP_LIMIT = 8;

type RankingScope = "geral" | "bairro";

interface ContributionRankingProps {
  explorers: ExplorerView[];
  currentUserId?: string;
  currentUserNeighborhood?: string;
}

/**
 * Ranking de contribuição, geral e do bairro.
 */
export function ContributionRanking({
  explorers,
  currentUserId,
  currentUserNeighborhood = "Centro",
}: ContributionRankingProps) {
  const [scope, setScope] = useState<RankingScope>("geral");

  const currentExplorer = useMemo(
    () => explorers.find((person) => person.id === currentUserId) ?? null,
    [explorers, currentUserId],
  );

  const activeNeighborhood =
    currentExplorer?.bairro ?? currentUserNeighborhood ?? "Centro";

  const ranked = useMemo(() => {
    const pool = explorers.filter(
      (person) => scope === "geral" || person.bairro === activeNeighborhood,
    );

    return [...pool].sort(
      (first, second) =>
        totalContributions(second) - totalContributions(first),
    );
  }, [explorers, scope, activeNeighborhood]);

  const myPosition = currentUserId
    ? ranked.findIndex((person) => person.id === currentUserId)
    : -1;
  const isOutsideTop = myPosition >= TOP_LIMIT;

  return (
    <Card size="sm" className="gap-3">
      {/* header - title */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrophyIcon className="size-4 text-amber-500" />
          Quem mais contribui
        </CardTitle>
        <CardDescription>
          Visitas, avaliações e pontos cadastrados somados
        </CardDescription>
      </CardHeader>

      {/* ranking - list */}
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setScope("geral")}
            className={cn(
              "flex-1 text-muted-foreground",
              scope === "geral" &&
                "bg-background text-foreground shadow-xs hover:bg-background",
            )}
          >
            Sorocaba
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setScope("bairro")}
            className={cn(
              "flex-1 text-muted-foreground",
              scope === "bairro" &&
                "bg-background text-foreground shadow-xs hover:bg-background",
            )}
          >
            {activeNeighborhood}
          </Button>
        </div>

        <ol className="flex flex-col gap-2">
          {ranked.slice(0, TOP_LIMIT).map((person, index) => (
            <RankingRow
              key={person.id}
              explorer={person}
              position={index + 1}
              isMe={person.id === currentUserId}
            />
          ))}
        </ol>

        {isOutsideTop && currentExplorer && (
          <div className="border-border border-t pt-2">
            <RankingRow
              explorer={currentExplorer}
              position={myPosition + 1}
              isMe
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface RankingRowProps {
  explorer: ExplorerView;
  position: number;
  isMe: boolean;
}

function RankingRow({ explorer, position, isMe }: RankingRowProps) {
  const content = (
    <>
      <span className="w-5 shrink-0 text-center text-muted-foreground text-xs tabular-nums">
        {position}
      </span>

      <Avatar
        className="size-8"
        identifier={explorer.id ?? explorer.nome}
      >
        {explorer.avatarUrl && (
          <AvatarImage src={explorer.avatarUrl} alt={explorer.nome} />
        )}
        <AvatarFallback className="text-[10px]">
          {explorer.iniciais}
        </AvatarFallback>
      </Avatar>

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium text-sm">{explorer.nome}</span>
        <span className="truncate text-muted-foreground text-xs">
          {explorerTitle(explorer.conquistas)} · {explorer.bairro}
        </span>
      </span>

      <span className="shrink-0 font-semibold text-sm tabular-nums">
        {totalContributions(explorer)}
      </span>
    </>
  );

  if (isMe) {
    return (
      <li className="flex items-center gap-3 rounded-lg bg-primary/10 px-2 py-1.5">
        {content}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={`/community/${explorer.id}`}
        className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
      >
        {content}
      </Link>
    </li>
  );
}
