"use client";

import { SearchIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter } from "@/components/blocks/site-footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { isVerifiedExplorer } from "@/constants/verification";
import { listExplorers } from "@/http/community/community";
import { type ExplorerMock, explorersMock } from "@/mocks/community";
import { publishedStoriesMock } from "@/mocks/stories";

import { ContributionRanking } from "./contribution-ranking";
import { ExplorerCard } from "./explorer-card";
import { RecentAchievements } from "./recent-achievements";
import { StoryGeneratorDialog } from "./story-generator-dialog";
import { StoryShowcase } from "./story-showcase";
import { VerificationCard } from "./verification-card";

/** Alinha cabeçalho e conteúdo no mesmo eixo largo das outras telas de leitura. */
const CONTENT_WIDTH = "mx-auto flex w-full max-w-6xl";

/**
 * Comunidade integrada à API com fallback para mocks.
 */
export function CommunityWorkspace() {
  const [search, setSearch] = useState("");
  const [explorers, setExplorers] = useState<ExplorerMock[]>(explorersMock);

  useEffect(() => {
    async function loadExplorers() {
      try {
        const res = await listExplorers({ PageSize: 50 });
        if (res.status === 200 && res.data.items.length > 0) {
          const mapped: ExplorerMock[] = res.data.items.map((e, idx) => ({
            id: idx + 1,
            nome: e.name,
            iniciais: e.name.slice(0, 2).toUpperCase(),
            bairro: e.neighborhood ?? "Sorocaba",
            desde: "Recentemente",
            pontosCadastrados: Number(e.approvedPlacesCount),
            contribuicoesSemana: Number(e.contributionScore),
            bio: "Explorador ativo de Sorocaba",
            avatarUrl: e.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.name}`,
            visitas: Number(e.visitsCount),
            avaliacoes: Number(e.reviewsCount),
            conquistas: Number(e.achievementsCount),
            mesesNaPlataforma: Math.max(1, Math.floor((Date.now() - new Date(e.joinedAt).getTime()) / (1000 * 60 * 60 * 24 * 30))),
            avaliacoesRemovidas: 0,
            ultimasAvaliacoes: [],
          }));
          setExplorers(mapped);
        }
      } catch {
        // Fallback silencioso
      }
    }

    loadExplorers();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return explorers;

    return explorers.filter(
      (person) =>
        person.nome.toLowerCase().includes(query) ||
        person.bairro.toLowerCase().includes(query),
    );
  }, [explorers, search]);

  const verifiedCount = explorers.filter(isVerifiedExplorer).length;

  return (
    <main className="flex flex-1 flex-col">
      <PageSection
        title="Comunidade"
        description="Quem explora Sorocaba, o que anda contribuindo e as pautas da cidade"
        className="gap-6"
        actions={<StoryGeneratorDialog />}
        subitems={
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{explorers.length} exploradores</Badge>
            <Badge variant="outline">{verifiedCount} verificados</Badge>
            <Badge variant="outline">
              {publishedStoriesMock.length} pautas publicadas
            </Badge>
          </div>
        }
      >
        <div className={`${CONTENT_WIDTH} flex-col gap-8`}>
          <StoryShowcase stories={publishedStoriesMock} />

          <RecentAchievements />

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

              {filtered.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground text-sm">
                  Ninguém encontrado com esse termo.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filtered.map((person) => (
                    <ExplorerCard key={person.id} explorer={person} />
                  ))}
                </div>
              )}
            </div>

            <aside className="hidden w-80 shrink-0 flex-col gap-4 xl:flex">
              <ContributionRanking />
              <VerificationCard />
            </aside>
          </div>
        </div>
      </PageSection>

      <SiteFooter />
    </main>
  );
}
