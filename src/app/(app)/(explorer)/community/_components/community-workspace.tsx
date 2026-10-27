"use client";

import { SearchIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { use, useMemo, useState } from "react";
import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter } from "@/components/blocks/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isVerifiedExplorer } from "@/constants/verification";
import type { getMyVerificationStatusResponse } from "@/http/activity/activity";
import type { StorySummaryDto } from "@/http/api.schemas";
import type { listExplorersResponse } from "@/http/community/community";
import type { getFeedResponse } from "@/http/feed/feed";
import type { listStoriesResponse } from "@/http/stories/stories";
import type { ExplorerView } from "@/types/community";
import type { FeedConquistaItem } from "@/types/feed";
import type { SessionPayload } from "@/types/session";
import type { StoryView } from "@/types/stories";
import { mapFeedItemDtoToView } from "@/utils/mappers/feed-mapper";
import { ContributionRanking } from "./contribution-ranking";
import { ExplorerCard } from "./explorer-card";
import { RecentAchievements } from "./recent-achievements";
import { StoryShowcase } from "./story-showcase";
import { VerificationCard } from "./verification-card";

const CONTENT_WIDTH = "mx-auto flex w-full max-w-6xl";

interface CommunityWorkspaceProps {
  session: SessionPayload | null;
  promises: {
    explorersPromise: Promise<listExplorersResponse>;
    storiesPromise: Promise<listStoriesResponse>;
    verificationPromise: Promise<getMyVerificationStatusResponse>;
    feedPromise: Promise<getFeedResponse>;
  };
}

/**
 * Avalia se a pauta está com status publicado, suportando serialização em string camelCase ou numérica.
 */
function isStoryPublished(status: string | number | undefined): boolean {
  return status === 1 || String(status).toLowerCase() === "published";
}

/**
 * Avalia se a origem da pauta foi gerada por inteligência artificial, suportando serialização em string camelCase ou numérica.
 */
function isStoryAiGenerated(origin: string | number | undefined): boolean {
  return origin === 1 || String(origin).toLowerCase() === "aigenerated";
}

/**
 * Converte o DTO resumido de pauta retornado pela API para o modelo de visualização da vitrine.
 */
function mapStorySummaryToCurated(dto: StorySummaryDto): StoryView {
  return {
    id: dto.id,
    slug: dto.slug,
    chapeu: dto.neighborhood ?? "Sorocaba",
    titulo: dto.title,
    chamada: dto.subtitle,
    corpo: [],
    fotoUrl:
      dto.coverPhotoUrl ??
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    status: isStoryPublished(dto.status) ? "publicada" : "rascunho",
    origem: isStoryAiGenerated(dto.origin) ? "ia" : "equipe",
    tempoLeitura: 4,
    diasAtras: Math.max(
      0,
      Math.floor(
        (Date.now() - new Date(dto.createdAt).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    ),
    locais: [],
    locaisCount: Number(dto.placesCount ?? 0),
  };
}

/**
 * Área principal da Comunidade integrada via Streaming SSR (`use()` + `useMemo()`).
 */
export function CommunityWorkspace({
  session,
  promises,
}: CommunityWorkspaceProps) {
  const explorersResponse = use(promises.explorersPromise);
  const storiesResponse = use(promises.storiesPromise);
  const verificationResponse = use(promises.verificationPromise);
  const feedResponse = use(promises.feedPromise);

  const [search, setSearch] = useState("");

  const rawRole =
    session?.role ??
    // @ts-expect-error compatibilidade caso o payload venha aninhado como user.role
    session?.user?.role;

  const isAdmin =
    typeof rawRole === "string"
      ? rawRole.trim().toLowerCase() === "admin"
      : rawRole === 1;

  const explorers = useMemo<ExplorerView[]>(() => {
    if (explorersResponse.status !== 200 || !explorersResponse.data.items)
      return [];

    return explorersResponse.data.items.map((explorer) => ({
      id: explorer.id,
      nome: explorer.name,
      iniciais: explorer.name.slice(0, 2).toUpperCase(),
      bairro: explorer.neighborhood ?? "Sorocaba",
      desde: new Date(explorer.joinedAt).toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      }),
      pontosCadastrados: Number(explorer.approvedPlacesCount),
      contribuicoesSemana: Number(explorer.contributionScore),
      bio: "Explorador ativo de Sorocaba",
      avatarUrl: explorer.avatarUrl ?? undefined,
      visitas: Number(explorer.visitsCount),
      avaliacoes: Number(explorer.reviewsCount),
      conquistas: Number(explorer.achievementsCount),
      mesesNaPlataforma: Math.max(
        1,
        Math.floor(
          (Date.now() - new Date(explorer.joinedAt).getTime()) /
            (1000 * 60 * 60 * 24 * 30),
        ),
      ),
      avaliacoesRemovidas: 0,
      ultimasAvaliacoes: [],
    }));
  }, [explorersResponse]);

  const stories = useMemo<StoryView[]>(() => {
    if (storiesResponse.status !== 200 || !storiesResponse.data.items)
      return [];

    const initialStories = storiesResponse.data.items.map(
      mapStorySummaryToCurated,
    );

    if (!isAdmin) {
      return initialStories.filter((story) => story.status === "publicada");
    }

    return initialStories;
  }, [storiesResponse, isAdmin]);

  const verificationStatus = useMemo(() => {
    if (verificationResponse.status === 200) return verificationResponse.data;
    return null;
  }, [verificationResponse]);

  const recentAchievements = useMemo<FeedConquistaItem[]>(() => {
    if (feedResponse.status !== 200 || !feedResponse.data.items) return [];

    return feedResponse.data.items
      .map(mapFeedItemDtoToView)
      .filter((item): item is FeedConquistaItem => item?.kind === "conquista");
  }, [feedResponse]);

  const filteredExplorers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return explorers;

    return explorers.filter(
      (person) =>
        person.nome.toLowerCase().includes(query) ||
        person.bairro.toLowerCase().includes(query),
    );
  }, [explorers, search]);

  const verifiedCount = useMemo(
    () => explorers.filter(isVerifiedExplorer).length,
    [explorers],
  );

  const publishedStoriesCount = useMemo(
    () => stories.filter((story) => story.status === "publicada").length,
    [stories],
  );

  return (
    <main className="flex flex-1 flex-col">
      {/* community - section */}
      <PageSection
        title="Comunidade"
        description="Quem explora Sorocaba, o que anda contribuindo e as pautas da cidade"
        className="gap-6"
        actions={
          isAdmin ? (
            <Button asChild>
              <Link href="/community/new-story">
                <SparklesIcon className="mr-1.5 size-4" />
                Nova pauta
              </Link>
            </Button>
          ) : undefined
        }
        subitems={
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{explorers.length} exploradores</Badge>
            <Badge variant="outline">{verifiedCount} verificados</Badge>
            <Badge variant="outline">
              {publishedStoriesCount} pautas publicadas
            </Badge>
          </div>
        }
      >
        <div className={`${CONTENT_WIDTH} flex-col gap-8`}>
          {/* stories - showcase */}
          <StoryShowcase stories={stories} />

          {/* achievements - strip */}
          <RecentAchievements items={recentAchievements} />

          {/* explorers and ranking - layout */}
          <div className="flex gap-6">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold text-lg">Exploradores</h2>

                <div className="relative w-full sm:w-72">
                  <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por nome ou bairro..."
                    className="pl-9"
                  />
                </div>
              </div>

              {filteredExplorers.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground text-sm">
                  Ninguém encontrado com esse termo.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredExplorers.map((person) => (
                    <ExplorerCard key={person.id} explorer={person} />
                  ))}
                </div>
              )}
            </div>

            <aside className="hidden w-80 shrink-0 flex-col gap-4 xl:flex">
              <ContributionRanking
                explorers={explorers}
                currentUserId={session?.id}
                currentUserNeighborhood={session?.neighborhood ?? "Centro"}
              />
              <VerificationCard verificationStatus={verificationStatus} />
            </aside>
          </div>
        </div>
      </PageSection>

      <SiteFooter />
    </main>
  );
}
