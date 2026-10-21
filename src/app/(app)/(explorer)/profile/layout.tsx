import { BadgeCheckIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { PageSection } from "@/components/blocks/page-section";
import { StatCard } from "@/components/blocks/stat-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { explorerCredential } from "@/constants/explorer-titles";
import { CURRENT_USER_TAG } from "@/constants/users";
import { isVerifiedExplorer } from "@/constants/verification";
import { getCurrentUser } from "@/http/users/users";
import { getSession } from "@/lib/session";
import { currentExplorerMock, totalContributions } from "@/mocks/community";

import { ProfileAccountSheet } from "./_components/profile-account-sheet";
import { ProfileTabs } from "./_components/profile-tabs";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const letters = parts.length > 1 ? [parts[0], parts.at(-1)] : [parts[0]];

  return letters
    .map((part) => part?.charAt(0).toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export default async function ProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [session, currentUserResponse] = await Promise.all([
    getSession(),
    getCurrentUser({ next: { tags: [CURRENT_USER_TAG] } }),
  ]);

  const user = currentUserResponse.status === 200 ? currentUserResponse.data : null;

  const nome = user?.name ?? session?.name ?? "Explorador";
  const email = user?.email ?? session?.email ?? "";
  const neighborhood = user?.neighborhood ?? session?.neighborhood ?? "Sorocaba";
  const avatarUrl = user?.avatarUrl ?? session?.avatarUrl ?? undefined;
  const biography = user?.biography;

  const explorer = currentExplorerMock;
  const verified = isVerifiedExplorer(explorer);

  return (
    <main className="flex flex-1 flex-col">
      <PageSection
        title={nome}
        description={
          biography
            ? biography
            : `${explorerCredential(explorer.conquistas)} · desde ${explorer.desde}`
        }
        className="mx-auto w-full max-w-5xl gap-6"
        actions={
          <div className="flex items-center gap-2">
            <ProfileAccountSheet
              initialData={{
                name: nome,
                email,
                neighborhood,
                biography,
              }}
            />
            <Button asChild variant="outline" size="sm">
              <Link href={`/community/${explorer.id}`}>Ver perfil público</Link>
            </Button>
          </div>
        }
        subitems={
          <div className="mt-4 flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <Avatar className="size-16 shrink-0">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={nome} />}
                <AvatarFallback>{initialsOf(nome)}</AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-sm">{email}</span>

                <div className="flex flex-wrap items-center gap-2">
                  {verified && (
                    <Badge className="bg-sky-500 text-white">
                      <BadgeCheckIcon className="size-3" />
                      Explorador verificado
                    </Badge>
                  )}

                  <Badge variant="outline">
                    <MapPinIcon className="size-3" />
                    {neighborhood}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <StatCard
                label="Contribuições"
                value={totalContributions(explorer)}
              />
              <StatCard label="Visitas" value={explorer.visitas} />
              <StatCard label="Avaliações" value={explorer.avaliacoes} />
              <StatCard label="Conquistas" value={explorer.conquistas} />
            </div>

            <ProfileTabs />
          </div>
        }
      >
        {children}
      </PageSection>
    </main>
  );
}
