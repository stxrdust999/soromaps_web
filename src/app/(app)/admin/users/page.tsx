import { Suspense } from "react";

import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter } from "@/components/blocks/site-footer";
import { TableSkeletonState } from "@/components/table/table-skeleton-state";
import { Skeleton } from "@/components/ui/skeleton";
import { USERS_LIST_TAG } from "@/constants/users";
import { listUsers } from "@/http/users/users";
import { UsersTable } from "./_components/table";
import { UserPageAction } from "./_components/page-action";
import { UsersSummaryBadges } from "./_components/users-summary-badges";

/**
 * Gerenciamento de Usuários integrado à API via Streaming SSR sem bloqueio no servidor.
 */
export default function ManageUsersPage() {
  const usersPromise = listUsers(
    { Page: 1, PageSize: 100 },
    { next: { tags: [USERS_LIST_TAG] } },
  );

  const promises = { usersPromise };

  const subitem = (
    <Suspense
      fallback={
        <div className="flex flex-row gap-2 items-center mt-1">
          <Skeleton className="h-8 w-44 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-36 rounded-full" />
        </div>
      }
    >
      <UsersSummaryBadges promises={promises} />
    </Suspense>
  );

  return (
    <main className="flex flex-1 flex-col">
      {/* users management - section */}
      <PageSection
        title="Gerenciamento de Usuários"
        description="Gerencie os usuários cadastrados na plataforma."
        actions={<UserPageAction />}
        subitems={subitem}
      >
        <Suspense fallback={<TableSkeletonState columns={5} />}>
          <UsersTable promises={promises} />
        </Suspense>
      </PageSection>

      <SiteFooter />
    </main>
  );
}
