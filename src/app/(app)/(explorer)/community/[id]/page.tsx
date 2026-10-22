import { BadgeCheckIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageSection } from "@/components/blocks/page-section";
import { StarRating } from "@/components/blocks/star-rating";
import { StatCard } from "@/components/blocks/stat-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { explorerCredential } from "@/constants/explorer-titles";
import { explorerProfileTag } from "@/constants/reports";
import {
  isVerifiedExplorer,
  missingForVerification,
} from "@/constants/verification";
import { getCommunityUserProfile } from "@/http/community/community";
import { getExplorerMock, totalContributions } from "@/mocks/community";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";

interface ExplorerProfilePageProps {
  params: Promise<{ id: string }>;
}

/**
 * Perfil público de um explorador.
 */
export default async function ExplorerProfilePage({
  params,
}: ExplorerProfilePageProps) {
  const { id } = await params;
  let explorer = getExplorerMock(Number(id));

  // Tenta carregar perfil real da API se for GUID ou se endpoint responder
  try {
    const res = await getCommunityUserProfile(id, { next: { tags: [explorerProfileTag(id)] } });
    if (res.status === 200) {
      const data = res.data;
      explorer = {
        id: Number(id) || 1,
        nome: data.name,
        iniciais: data.name.slice(0, 2).toUpperCase(),
        bairro: data.neighborhood ?? "Sorocaba",
        desde: "Recentemente",
        pontosCadastrados: Number(data.approvedPlacesCount),
        contribuicoesSemana: Number(data.contributionScore),
        bio: data.biography ?? "Explorador de Sorocaba",
        avatarUrl: data.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
        visitas: Number(data.visitsCount),
        avaliacoes: Number(data.reviewsCount),
        conquistas: Number(data.achievementsCount),
        mesesNaPlataforma: Math.max(1, Math.floor((Date.now() - new Date(data.joinedAt).getTime()) / (1000 * 60 * 60 * 24 * 30))),
        avaliacoesRemovidas: 0,
        ultimasAvaliacoes: data.recentReviews.map((r, rIdx) => ({
          local: {
            id: rIdx + 1,
            nome: "Local em Sorocaba",
            bairro: "Sorocaba",
          },
          nota: Number(r.rating),
          corpo: r.content,
          uteis: Number(r.usefulVotesCount),
          diasAtras: Math.max(0, Math.floor((Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24))),
        })),
      };
    }
  } catch {
    // Mantém fallback do mock se id bater
  }

  if (!explorer) notFound();

  const verified = isVerifiedExplorer(explorer);
  const missing = missingForVerification(explorer);

  return (
    <main className="flex flex-1 flex-col">
      <PageSection
        title={explorer.nome}
        description={`${explorerCredential(explorer.conquistas)} · desde ${explorer.desde}`}
        className="mx-auto w-full max-w-4xl gap-6"
        actions={
          <Button asChild variant="outline">
            <Link href="/community">Voltar à comunidade</Link>
          </Button>
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
        <div className="grid gap-3 sm:grid-cols-4">
          <StatCard
            label="Contribuições"
            value={totalContributions(explorer)}
          />
          <StatCard label="Visitas" value={explorer.visitas} />
          <StatCard label="Avaliações" value={explorer.avaliacoes} />
          <StatCard label="Conquistas" value={explorer.conquistas} />
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-lg">Últimas avaliações</h2>

          {explorer.ultimasAvaliacoes.length === 0 ? (
            <p className="rounded-xl border border-border border-dashed p-8 text-center text-muted-foreground text-sm">
              Nenhuma avaliação pública ainda.
            </p>
          ) : (
            explorer.ultimasAvaliacoes.map((review) => (
              <Card key={`${review.local.id}-${review.diasAtras}`} size="sm">
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
