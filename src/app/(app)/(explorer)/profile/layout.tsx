import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";

import {
  MY_ACHIEVEMENTS_TAG,
  MY_STATS_TAG,
  MY_VERIFICATION_TAG,
} from "@/constants/achievements";
import { CURRENT_USER_TAG } from "@/constants/users";
import { listMyAchievements } from "@/http/achievements/achievements";
import { getMyStats, getMyVerificationStatus } from "@/http/activity/activity";
import { getCurrentUser } from "@/http/users/users";
import { getSession } from "@/lib/session";

import { ProfileHeaderContent } from "./_components/profile-header-content";
import { ProfileHeaderSkeleton } from "./_components/profile-header-skeleton";

export const metadata: Metadata = {
  title: "Meu Perfil",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Layout da área privada do perfil do explorador com streaming de Promises.
 */
export default async function ProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  const promises = {
    userPromise: getCurrentUser({ next: { tags: [CURRENT_USER_TAG] } }),
    statsPromise: getMyStats({ next: { tags: [MY_STATS_TAG] } }),
    verificationPromise: getMyVerificationStatus({
      next: { tags: [MY_VERIFICATION_TAG] },
    }),
    achievementsPromise: listMyAchievements({
      next: { tags: [MY_ACHIEVEMENTS_TAG] },
    }),
  };

  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeaderContent session={session} promises={promises}>
          {children}
        </ProfileHeaderContent>
      </Suspense>
    </main>
  );
}
