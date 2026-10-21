import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { PlaceCard } from "@/components/blocks/place-card";
import { PlaceRow } from "@/components/blocks/place-row";
import { StarRating } from "@/components/blocks/star-rating";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MY_ACHIEVEMENTS_TAG, MY_FAVORITES_TAG, MY_VERIFICATION_TAG, MY_VISITS_TAG } from "@/constants/achievements";
import { listMyAchievements } from "@/http/achievements/achievements";
import { getMyVerificationStatus, listMyFavorites, listMyVisits } from "@/http/activity/activity";
import { currentExplorerMock } from "@/mocks/community";
import {
  profileFavoriteIdsMock,
  profileLockedAchievements,
  profilePlace,
  profileVisitsMock,
  visitDaysAgo,
} from "@/mocks/profile";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";

import { AchievementProgressCard } from "./_components/achievement-progress-card";
import { VerificationChecklist } from "./_components/verification-checklist";

/** Quantos itens cada prévia da visão geral mostra antes de mandar para a aba. */
const PREVIEW_SIZE = 3;

/**
 * Carrega os dados reais do perfil com fallback para os mocks em caso de erro/ambiente sem API.
 */
async function loadProfileOverviewData() {
  const [verificationRes, achievementsRes, visitsRes, favoritesRes] = await Promise.allSettled([
    getMyVerificationStatus({ next: { tags: [MY_VERIFICATION_TAG] } }),
    listMyAchievements({ next: { tags: [MY_ACHIEVEMENTS_TAG] } }),
    listMyVisits({ PageSize: PREVIEW_SIZE }, { next: { tags: [MY_VISITS_TAG] } }),
    listMyFavorites({ PageSize: PREVIEW_SIZE }, { next: { tags: [MY_FAVORITES_TAG] } }),
  ]);

  const stats =
    verificationRes.status === "fulfilled" && verificationRes.value.status === 200
      ? {
          visitas: Number(verificationRes.value.data.visitsCount),
          avaliacoes: Number(verificationRes.value.data.publishedReviewsCount),
          avaliacoesRemovidas: Number(verificationRes.value.data.removedReviewsCount),
          mesesNaPlataforma: Math.floor(Number(verificationRes.value.data.accountAgeDays) / 30),
        }
      : currentExplorerMock;

  const proximaConquista =
    achievementsRes.status === "fulfilled" && achievementsRes.value.status === 200
      ? achievementsRes.value.data
          .filter((item) => !item.isUnlocked)
          .map((item) => {
            const current = Number(item.currentProgress);
            const req = Number(item.requiredQuantity);
            const progress = req > 0 ? Math.round((current / req) * 100) : 0;
            return {
              id: item.id,
              nome: item.name,
              descricao: item.description,
              criterio: item.description,
              meta: req,
              atual: current,
              badge: {
                id: item.id,
                name: item.name,
                title: item.name,
                description: item.description,
                icon: (item.icon as any) ?? "sparkles",
                accentColor: item.color,
                progress,
                trigger: "metric" as const,
                achievedAt: null,
              },
            };
          })
          .sort((a, b) => (b.badge.progress ?? 0) - (a.badge.progress ?? 0))[0] ?? null
      : profileLockedAchievements().at(0) ?? null;

  const ultimasVisitas =
    visitsRes.status === "fulfilled" && visitsRes.value.status === 200
      ? visitsRes.value.data.items.map((v) => ({
          id: v.place.id,
          markerId: v.place.id,
          nome: v.place.name,
          data: v.visitedOn,
          daysAgo: Math.max(0, Math.floor((Date.now() - new Date(v.visitedOn).getTime()) / (1000 * 60 * 60 * 24))),
        }))
      : profileVisitsMock.slice(0, PREVIEW_SIZE).map((v) => ({
          id: profilePlace(v.markerId).id,
          markerId: v.markerId,
          nome: profilePlace(v.markerId).nome,
          data: v.data,
          daysAgo: visitDaysAgo(v),
        }));

  const lugaresFavoritos =
    favoritesRes.status === "fulfilled" && favoritesRes.value.status === 200
      ? favoritesRes.value.data.items.map((f) => ({
          id: f.placeId,
          nome: f.placeName,
        }))
      : profileFavoriteIdsMock.slice(0, PREVIEW_SIZE).map((id) => ({
          id,
          nome: profilePlace(id).nome,
        }));

  return { stats, proximaConquista, ultimasVisitas, lugaresFavoritos };
}

/**
 * Visão geral do perfil do explorador autenticado.
 */
export default async function ProfilePage() {
  const { stats, proximaConquista, ultimasVisitas, lugaresFavoritos } = await loadProfileOverviewData();
  const explorer = currentExplorerMock;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-2">
        <VerificationChecklist stats={stats} />

        <div className="flex flex-col gap-3">
          <SectionHeader
            titulo="Próxima conquista"
            href="/profile/achievements"
          />

          {proximaConquista ? (
            <AchievementProgressCard item={proximaConquista} />
          ) : (
            <EmptyState texto="Você desbloqueou tudo que o catálogo oferece hoje." />
          )}
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <SectionHeader titulo="Últimas visitas" href="/profile/visits" />

        {ultimasVisitas.length === 0 ? (
          <EmptyState texto="Você ainda não registrou nenhuma visita." />
        ) : (
          ultimasVisitas.map((visita) => (
            <PlaceRow
              key={`${visita.markerId}-${visita.data}`}
              marker={{ id: visita.markerId, nome: visita.nome }}
              trailing={
                <span className="text-muted-foreground text-xs">
                  {formatWaitingDays(visita.daysAgo)}
                </span>
              }
            />
          ))
        )}
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader titulo="Lugares salvos" href="/profile/favorites" />

        {lugaresFavoritos.length === 0 ? (
          <EmptyState texto="Nenhum lugar salvo nos favoritos ainda." />
        ) : (
          <div className="flex flex-wrap gap-3">
            {lugaresFavoritos.map((lugar) => (
              <PlaceCard
                key={lugar.id}
                size="sm"
                marker={{ id: lugar.id, nome: lugar.nome }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-lg">Minhas avaliações</h2>

        {explorer.ultimasAvaliacoes.length === 0 ? (
          <EmptyState texto="Você ainda não escreveu nenhuma avaliação." />
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
    </div>
  );
}

function SectionHeader({ titulo, href }: { titulo: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="font-semibold text-lg">{titulo}</h2>

      <Button asChild variant="ghost" size="sm">
        <Link href={href}>
          Ver tudo
          <ArrowRightIcon className="size-3.5" />
        </Link>
      </Button>
    </div>
  );
}

function EmptyState({ texto }: { texto: string }) {
  return (
    <p className="rounded-xl border border-border border-dashed p-8 text-center text-muted-foreground text-sm">
      {texto}
    </p>
  );
}
