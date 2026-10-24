"use client";

import { ShieldUserIcon, UsersIcon } from "lucide-react";
import { use, useMemo } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { listUsersResponse } from "@/http/users/users";

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

interface UsersSummaryBadgesProps {
  promises: {
    usersPromise: Promise<listUsersResponse>;
  };
}

/**
 * Badges de resumo do gerenciamento de usuários hidratados via Streaming (`use()` + `useMemo()`).
 */
export function UsersSummaryBadges({ promises }: UsersSummaryBadgesProps) {
  const response = use(promises.usersPromise);

  const summary = useMemo(() => {
    const usersList = response.status === 200 ? response.data.items : [];
    const totalUsers =
      response.status === 200 ? Number(response.data.totalCount) : 0;
    const explorersCount = usersList.filter(
      (user) => user.role.toLowerCase() === "explorer",
    ).length;
    const adminsCount = usersList.filter(
      (user) => user.role.toLowerCase() === "admin",
    ).length;

    return {
      totalUsers,
      explorersCount,
      adminsCount,
      avatars: usersList.slice(0, 3),
    };
  }, [response]);

  return (
    <div className="flex flex-row gap-2 items-center mt-1">
      {/* total users - badge */}
      <Badge
        variant="default"
        className="bg-black px-2 py-4 flex flex-row gap-2"
      >
        <AvatarGroup>
          {summary.avatars.map((user) => (
            <Avatar key={user.id} className="size-4">
              {user.avatarUrl && (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              )}
              <AvatarFallback>
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>

        <span className="text-xs text-white">
          {summary.totalUsers} Usuários Cadastrados
        </span>
      </Badge>

      {/* explorers - badge */}
      <InformationBadge
        icon={<UsersIcon size={16} className="text-white/75" />}
        value={String(summary.explorersCount)}
        label="exploradores"
      />

      {/* admins - badge */}
      <InformationBadge
        icon={<ShieldUserIcon size={16} className="text-white/75" />}
        value={String(summary.adminsCount)}
        label="administradores"
      />
    </div>
  );
}
