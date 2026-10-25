"use client";

import {
  ArrowRightIcon,
  SlidersHorizontalIcon,
  TrophyIcon,
} from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { explorerTitle } from "@/constants/explorer-titles";
import { FEED_REASON_ORDER, FEED_REASONS } from "@/constants/feed";
import { cn } from "@/lib/utils";
import type {
  FeedContributorView,
  FeedTrendingPlaceView,
} from "@/types/feed";

import { ALL_REASONS, type FeedFilter } from "./use-feed";

interface FeedProfileSummary {
  bairro: string;
  categoriasFavoritas: string[];
  lugaresSalvos: number;
  visitasRegistradas: number;
}

interface FeedAsideProps {
  counts: Record<string, number>;
  active: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
  profileSummary: FeedProfileSummary;
  contributors: FeedContributorView[];
  trendingPlaces: FeedTrendingPlaceView[];
}

/**
 * Coluna de apoio do feed alimentada por dados reais da API.
 */
export function FeedAside({
  counts,
  active,
  onFilterChange,
  profileSummary,
  contributors,
  trendingPlaces,
}: FeedAsideProps) {
  const challengeGoal = 5;
  const challengeCurrent = Math.min(
    challengeGoal,
    profileSummary.visitasRegistradas,
  );
  const challengeProgress = Math.round(
    (challengeCurrent / challengeGoal) * 100,
  );

  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-4 xl:flex">
      {/* scope - card */}
      <Card size="sm" className="sticky top-4 gap-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
            Seu recorte
          </CardTitle>
          <CardDescription>
            {profileSummary.bairro} ·{" "}
            {profileSummary.categoriasFavoritas.length > 0
              ? profileSummary.categoriasFavoritas.join(" e ")
              : "Todas as categorias"}{" "}
            · {profileSummary.lugaresSalvos} lugares acompanhados
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-1">
          {FEED_REASON_ORDER.map((reason) => {
            const definition = FEED_REASONS[reason];
            const Icon = definition.icon;
            const count = counts[reason] ?? 0;

            return (
              <button
                key={reason}
                type="button"
                onClick={() =>
                  onFilterChange(active === reason ? ALL_REASONS : reason)
                }
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                  active === reason && "bg-muted",
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className="size-4 text-muted-foreground" />
                  {definition.label}
                </span>

                <span className="text-muted-foreground text-xs tabular-nums">
                  {count}
                </span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* weekly goal - card */}
      <Card size="sm" className="gap-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrophyIcon className="size-4 text-amber-500" />
            Jornada de exploração
          </CardTitle>
          <CardDescription>Primeiros passos na cidade</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-2">
          <p className="text-muted-foreground text-xs leading-relaxed">
            Registre pelo menos {challengeGoal} visitas na cidade para avançar
            rumo ao selo de Explorador Verificado.
          </p>

          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={challengeCurrent}
            aria-valuemin={0}
            aria-valuemax={challengeGoal}
            aria-label="Progresso de visitas"
          >
            <div
              className="h-full rounded-full bg-amber-500"
              style={{ width: `${challengeProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {challengeCurrent} de {challengeGoal} visitas
            </span>
            <Link
              href="/profile/achievements"
              className="text-primary hover:underline"
            >
              Ver conquistas
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* contributors - card */}
      {contributors.length > 0 && (
        <Card size="sm" className="gap-3">
          <CardHeader>
            <CardTitle>Exploradores da semana</CardTitle>
            <CardDescription>
              Ranking por contribuição registrada — não há seguidores para contar
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            {contributors.map((person, index) => (
              <Link
                key={person.id}
                href={`/community/${person.id}`}
                className="flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-muted"
              >
                <span className="w-4 shrink-0 text-center text-muted-foreground text-xs tabular-nums">
                  {index + 1}
                </span>

                <Avatar className="size-8">
                  {person.avatarUrl && (
                    <AvatarImage src={person.avatarUrl} alt={person.nome} />
                  )}
                  <AvatarFallback className="text-[10px]">
                    {person.iniciais}
                  </AvatarFallback>
                </Avatar>

                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium text-sm">
                    {person.nome}
                  </span>
                  <span className="truncate text-muted-foreground text-xs">
                    {explorerTitle(person.conquistas)} · {person.bairro}
                  </span>
                </div>

                <Badge variant="ghost" className="tabular-nums">
                  {person.contribuicoes}
                </Badge>
              </Link>
            ))}

            <Button asChild size="sm" variant="ghost" className="self-start">
              <Link href="/community">
                Ver a comunidade
                <ArrowRightIcon />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* trending - card */}
      {trendingPlaces.length > 0 && (
        <Card size="sm" className="gap-3">
          <CardHeader>
            <CardTitle>Movimento da semana</CardTitle>
            <CardDescription>
              Lugares com mais avaliações e visitas novas
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-1">
            {trendingPlaces.map((place) => (
              <Link
                key={place.id}
                href={`/places/${place.id}`}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{place.nome}</span>
                  <span className="truncate text-muted-foreground text-xs">
                    {place.bairro}
                  </span>
                </span>

                <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                  +{place.novidades}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </aside>
  );
}
