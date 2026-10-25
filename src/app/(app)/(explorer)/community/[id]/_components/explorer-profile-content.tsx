"use client";

import { BadgeCheckIcon, FlagIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { use, useMemo } from "react";

import { PageSection } from "@/components/blocks/page-section";
import { ReportDialog } from "@/components/blocks/report-dialog";
import { StarRating } from "@/components/blocks/star-rating";
import { StatCard } from "@/components/blocks/stat-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { explorerCredential } from "@/constants/explorer-titles";
import {
  isVerifiedExplorer,
  missingForVerification,
} from "@/constants/verification";
import type { getCommunityUserProfileResponse } from "@/http/community/community";
import { type ExplorerView, totalContributions } from "@/types/community";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";

interface ExplorerProfileContentProps {
  userId: string;
  promises: {
    profilePromise: Promise<getCommunityUserProfileResponse>;
  };
}

/**
 * Conteúdo do perfil público de um explorador via Streaming SSR (`use()` + `useMemo()`).
 */
export function ExplorerProfileContent({
  userId,
  promises,
}: ExplorerProfileContentProps) {
  const profileResponse = use(promises.profilePromise);

  const explorer = useMemo<ExplorerView | null>(() => {
    if (profileResponse.status !== 200) return null;
    const data = profileResponse.data;

    return {
      id: data.id,
      nome: data.name,
      iniciais: data.name.slice(0, 2).toUpperCase(),
      bairro: data.neighborhood ?? "Sorocaba",
      desde: new Date(data.joinedAt).toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      }),
      pontosCadastrados: Number(data.approvedPlacesCount),
      contribuicoesSemana: Number(data.contributionScore),
      bio: data.biography ?? "Explorador de Sorocaba",
      avatarUrl: data.avatarUrl ?? undefined,
      visitas: Number(data.visitsCount),
      avaliacoes: Number(data.reviewsCount),
      conquistas: Number(data.achievementsCount),
      mesesNaPlataforma: Math.max(
        1,
        Math.floor(
          (Date.now() - new Date(data.joinedAt).getTime()) /
            (1000 * 60 * 60 * 24 * 30),
        ),
      ),
      avaliacoesRemovidas: 0,
      ultimasAvaliacoes: (data.recentReviews ?? []).map((review) => ({
        local: {
          id: review.placeId,
          nome: review.placeName ?? "Local em Sorocaba",
          bairro: review.placeCategory ?? "Sorocaba",
        },
        nota: Number(review.rating),
        corpo: review.content,
        uteis: Number(review.usefulVotesCount),
        diasAtras: Math.max(
          0,
          Math.floor(
            (Date.now() - new Date(review.createdAt).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        ),
      })),
    };
  }, [profileResponse]);

  if (!explorer) {
    return (
      <PageSection
        title="Explorador não encontrado"
        description="Não foi possível carregar o perfil deste explorador."
        className="mx-auto w-full max-w-4xl gap-6"
        actions={
          <Button asChild variant="outline">
            <Link href="/community">Voltar à comunidade</Link>
          </Button>
        }
      >
        <p className="rounded-xl border border-border border-dashed p-8 text-center text-muted-foreground text-sm">
          Este perfil não está disponível.
        </p>
      </PageSection>
    );
  }

  const verified = isVerifiedExplorer(explorer);
  const missing = missingForVerification(explorer);

  return (
    <main className="flex flex-1 flex-col">
      {/* profile - section */}
      <PageSection
        title={explorer.nome}
        description={`${explorerCredential(explorer.conquistas)} · desde ${explorer.desde}`}
        className="mx-auto w-full max-w-4xl gap-6"
        actions={
          <div className="flex items-center gap-2">
            <ReportDialog
              targetType="user"
              targetId={userId}
              targetLabel={explorer.nome}
              trigger={
                <Button variant="outline" size="sm">
                  <FlagIcon className="size-4" />
                  Denunciar perfil
                </Button>
              }
            />

            <Button asChild variant="outline" size="sm">
              <Link href="/community">Voltar à comunidade</Link>
            </Button>
          </div>
        }
        subitems={
          <div className="mt-4 flex items-start gap-4">
            <Avatar className="size-16 shrink-0">
              {explorer.avatarUrl && (
                <AvatarImage src={explorer.avatarUrl} alt={explorer.nome} />
              )}
              <AvatarFallback>{explorer.iniciais}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {verified ? (
                  <Badge className="bg-sky-500 text-white">
                    <BadgeCheckIcon className="size-3" />
                    Explorador verificado
                  </Badge>
                ) : (
                  <Badge variant="outline" title={missing.join(", ")}>
                    Ainda sem o selo
                  </Badge>
                )}

                <Badge variant="outline">
                  <MapPinIcon className="size-3" />
                  {explorer.bairro}
                </Badge>
              </div>

              {explorer.bio && (
                <p className="max-w-prose text-muted-foreground text-sm">
                  {explorer.bio}
                </p>
              )}
            </div>
          </div>
        }
      >
        {/* stats - grid */}
        <div className="grid gap-3 sm:grid-cols-4">
          <StatCard
            label="Contribuições"
            value={totalContributions(explorer)}
          />
          <StatCard label="Visitas" value={explorer.visitas} />
          <StatCard label="Avaliações" value={explorer.avaliacoes} />
          <StatCard label="Conquistas" value={explorer.conquistas} />
        </div>

        {/* reviews - list */}
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-lg">Últimas avaliações</h2>

          {explorer.ultimasAvaliacoes.length === 0 ? (
            <p className="rounded-xl border border-border border-dashed p-8 text-center text-muted-foreground text-sm">
              Nenhuma avaliação pública ainda.
            </p>
          ) : (
            explorer.ultimasAvaliacoes.map((review, index) => (
              <Card
                key={`${review.local.id}-${review.diasAtras}-${index}`}
                size="sm"
              >
                <CardContent className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={`/places/${review.local.id}`}
                      className="font-semibold text-sm hover:underline"
                    >
                      {review.local.nome}
                    </Link>

                    <span className="text-muted-foreground text-xs">
                      {review.local.bairro} ·{" "}
                      {formatWaitingDays(review.diasAtras)}
                    </span>
                  </div>

                  <StarRating nota={review.nota} showValue />

                  <p className="text-pretty text-sm leading-relaxed">
                    {review.corpo}
                  </p>

                  <span className="text-muted-foreground text-xs">
                    {review.uteis} pessoas acharam útil
                  </span>
                </CardContent>
              </Card>
            ))
          )}
        </section>
      </PageSection>
    </main>
  );
}
