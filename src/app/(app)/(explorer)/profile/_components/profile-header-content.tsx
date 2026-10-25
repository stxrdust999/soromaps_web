"use client";

import { BadgeCheckIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { type ReactNode, use, useMemo } from "react";

import { PageSection } from "@/components/blocks/page-section";
import { StatCard } from "@/components/blocks/stat-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { explorerCredential } from "@/constants/explorer-titles";
import { isVerifiedExplorer } from "@/constants/verification";
import type { listMyAchievementsResponse } from "@/http/achievements/achievements";
import type {
  getMyStatsResponse,
  getMyVerificationStatusResponse,
} from "@/http/activity/activity";
import type { getCurrentUserResponse } from "@/http/users/users";
import type { SessionUser } from "@/types/session";

import { ProfileAccountSheet } from "./profile-account-sheet";
import { ProfileTabs } from "./profile-tabs";

interface ProfileHeaderContentProps {
  session: SessionUser | null;
  promises: {
    userPromise: Promise<getCurrentUserResponse>;
    statsPromise: Promise<getMyStatsResponse>;
    verificationPromise: Promise<getMyVerificationStatusResponse>;
    achievementsPromise: Promise<listMyAchievementsResponse>;
  };
  children: ReactNode;
}

const monthYearFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const letters = parts.length > 1 ? [parts[0], parts.at(-1)] : [parts[0]];

  return letters
    .map((part) => part?.charAt(0).toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

/**
 * Cabeçalho do perfil do explorador resolvido via streaming de Promises.
 * Consolida dados da conta, verificação de selo e métricas principais.
 */
export function ProfileHeaderContent({
  session,
  promises,
  children,
}: ProfileHeaderContentProps) {
  const userResponse = use(promises.userPromise);
  const statsResponse = use(promises.statsPromise);
  const verificationResponse = use(promises.verificationPromise);
  const achievementsResponse = use(promises.achievementsPromise);

  const profileSummary = useMemo(() => {
    const user = userResponse.status === 200 ? userResponse.data : undefined;
    const stats = statsResponse.status === 200 ? statsResponse.data : undefined;
    const verification =
      verificationResponse.status === 200
        ? verificationResponse.data
        : undefined;
    const achievements =
      achievementsResponse.status === 200
        ? (achievementsResponse.data ?? [])
        : [];

    const userId = user?.id ?? session?.id ?? "";
    const nome = user?.name ?? session?.name ?? "Explorador";
    const email = user?.email ?? session?.email ?? "";
    const neighborhood =
      user?.neighborhood ?? session?.neighborhood ?? "Sorocaba";
    const avatarUrl = user?.avatarUrl ?? session?.avatarUrl ?? undefined;
    const biography = user?.biography ?? undefined;

    const unlockedAchievementsCount = achievements.filter(
      (achievement) => achievement.isUnlocked,
    ).length;
    const visitsCount = Number(
      stats?.totalVisits ?? verification?.visitsCount ?? 0,
    );
    const reviewsCount = Number(
      stats?.totalReviews ?? verification?.publishedReviewsCount ?? 0,
    );
    const removedReviewsCount = Number(verification?.removedReviewsCount ?? 0);
    const accountAgeMonths = Math.floor(
      Number(verification?.accountAgeDays ?? 0) / 30,
    );

    const joinedDate = user?.createdAt
      ? monthYearFormatter.format(new Date(user.createdAt))
      : "recentemente";

    const verified =
      verification?.isVerified ??
      isVerifiedExplorer({
        visitas: visitsCount,
        avaliacoes: reviewsCount,
        avaliacoesRemovidas: removedReviewsCount,
        mesesNaPlataforma: accountAgeMonths,
      });

    const totalContributionsCount = visitsCount + reviewsCount;

    return {
      userId,
      nome,
      email,
      neighborhood,
      avatarUrl,
      biography,
      unlockedAchievementsCount,
      visitsCount,
      reviewsCount,
      joinedDate,
      verified,
      totalContributionsCount,
    };
  }, [
    userResponse,
    statsResponse,
    verificationResponse,
    achievementsResponse,
    session,
  ]);

  return (
    <PageSection
      title={profileSummary.nome}
      description={
        profileSummary.biography
          ? profileSummary.biography
          : `${explorerCredential(profileSummary.unlockedAchievementsCount)} · desde ${profileSummary.joinedDate}`
      }
      className="mx-auto w-full max-w-5xl gap-6"
      actions={
        <div className="flex items-center gap-2">
          <ProfileAccountSheet
            initialData={{
              name: profileSummary.nome,
              email: profileSummary.email,
              neighborhood: profileSummary.neighborhood,
              biography: profileSummary.biography,
            }}
          />
          {profileSummary.userId && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/community/${profileSummary.userId}`}>
                Ver perfil público
              </Link>
            </Button>
          )}
        </div>
      }
      subitems={
        <div className="mt-4 flex flex-col gap-6">
          {/* identity - section */}
          <div className="flex items-start gap-4">
            <Avatar className="size-16 shrink-0">
              {profileSummary.avatarUrl && (
                <AvatarImage
                  src={profileSummary.avatarUrl}
                  alt={profileSummary.nome}
                />
              )}
              <AvatarFallback>{initialsOf(profileSummary.nome)}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground text-sm">
                {profileSummary.email}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {profileSummary.verified && (
                  <Badge className="bg-sky-500 text-white">
                    <BadgeCheckIcon className="size-3" />
                    Explorador verificado
                  </Badge>
                )}

                <Badge variant="outline">
                  <MapPinIcon className="size-3" />
                  {profileSummary.neighborhood}
                </Badge>
              </div>
            </div>
          </div>

          {/* metrics - section */}
          <div className="grid gap-3 sm:grid-cols-4">
            <StatCard
              label="Contribuições"
              value={profileSummary.totalContributionsCount}
            />
            <StatCard label="Visitas" value={profileSummary.visitsCount} />
            <StatCard label="Avaliações" value={profileSummary.reviewsCount} />
            <StatCard
              label="Conquistas"
              value={profileSummary.unlockedAchievementsCount}
            />
          </div>

          <ProfileTabs />
        </div>
      }
    >
      {children}
    </PageSection>
  );
}
