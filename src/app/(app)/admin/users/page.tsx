import { ShieldUserIcon, UsersIcon } from "lucide-react";
import { Suspense } from "react";
import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter } from "@/components/blocks/site-footer";
import { TableSkeletonState } from "@/components/table/table-skeleton-state";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { USERS_LIST_TAG } from "@/constants/users";
import { listUsers } from "@/http/users/users";
import { UsersTable } from "./_components/table";

interface InformationBadgeProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function InformationBadge({ icon, value, label }: InformationBadgeProps) {
  return (
    <Badge
      variant="default"
      className="px-3 py-4 items-center flex flex-row gap-2 bg-black"
    >
      {icon}

      <div className="flex flex-row gap-1 items-center">
        <span className="text-xs text-white font-semibold">{value}</span>
        <span className="text-xs text-white/75">{label}</span>
      </div>
    </Badge>
  );
}

/**
 * Server Component orchestrating user management data.
 * Initiates user list promise with revalidation tags and calculates role counters.
 */
export default async function ManageUsersPage() {
  const usersPromise = listUsers(
    { page: 1, pageSize: 100 },
    { next: { tags: [USERS_LIST_TAG] } },
  );

  const promises = { usersPromise };

  const initialResponse = await usersPromise;
  const usersList = initialResponse.status === 200 ? initialResponse.data.items : [];
  const totalUsers = initialResponse.status === 200 ? initialResponse.data.totalCount : 0;
  const explorersCount = usersList.filter((u) => u.role.toLowerCase() === "explorer").length;
  const adminsCount = usersList.filter((u) => u.role.toLowerCase() === "admin").length;

  const subitem = (
    <div className="flex flex-row gap-2 items-center mt-1">
      <Badge
        variant="default"
        className="bg-black px-2 py-4 flex flex-row gap-2"
      >
        <AvatarGroup>
          <Avatar className="size-4">
            <AvatarImage
              src="https://github.com/maxleiter.png"
              alt="@maxleiter"
            />
            <AvatarFallback>LR</AvatarFallback>
          </Avatar>
          <Avatar className="size-4">
            <AvatarImage
              src="https://github.com/evilrabbit.png"
              alt="@evilrabbit"
            />
            <AvatarFallback>ER</AvatarFallback>
          </Avatar>
          <Avatar className="size-4">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </AvatarGroup>

        <span className="text-xs text-white">{totalUsers} Usuários Cadastrados</span>
      </Badge>

      <InformationBadge
        icon={<UsersIcon size={16} className="text-white/75" />}
        value={String(explorersCount)}
        label="exploradores"
      />

      <InformationBadge
        icon={<ShieldUserIcon size={16} className="text-white/75" />}
        value={String(adminsCount)}
        label="administradores"
      />
    </div>
  );

  return (
    <main className="flex flex-1 flex-col">
      <PageSection
        title="Gerenciamento de Usuários"
        description="Gerencie os usuários cadastrados na plataforma."
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
