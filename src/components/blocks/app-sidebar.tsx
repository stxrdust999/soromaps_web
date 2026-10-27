import { MapIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  NAV_GROUP_ADMIN,
  NAV_GROUP_EXPLORER,
  NAV_GROUP_GENERAL,
} from "@/constants/navigation";
import { CURRENT_USER_TAG } from "@/constants/users";
import { getCurrentUser } from "@/http/users/users";
import { getSession } from "@/lib/session";
import { SidebarRouteButton } from "./sidebar-route-button";
import { SidebarUserSection } from "./sidebar-user-section";

/**
 * Barra lateral principal da aplicação autenticada.
 * Hidrata os dados do perfil no rodapé a partir de `/api/users/me` com fallback para a sessão em cookie.
 */
export async function AppSidebar() {
  const session = await getSession();
  let currentUser = null;

  if (session) {
    try {
      const userResponse = await getCurrentUser({
        next: { tags: [CURRENT_USER_TAG] },
      });
      if (userResponse.status === 200)
        currentUser = userResponse.data;
    } catch {
      currentUser = null;
    }
  }

  const name = currentUser?.name ?? session?.name ?? "Explorador";
  const email = currentUser?.email ?? session?.email ?? "";
  const initials = name.charAt(0).toUpperCase() || "E";
  const avatarUrl = currentUser?.avatarUrl ?? session?.avatarUrl ?? undefined;
  const role =
    (currentUser?.role ?? session?.role)?.toLowerCase() === "admin"
      ? "admin"
      : "user";
  const isAdmin = role === "admin";

  const navigationGroups = [
    NAV_GROUP_GENERAL,
    NAV_GROUP_EXPLORER,
    ...(isAdmin ? [NAV_GROUP_ADMIN] : []),
  ];

  return (
    <Sidebar className="overflow-hidden">
      <SidebarHeader className="shrink-0 px-5 py-4">
        <div className="flex flex-row gap-3 items-center">
          <div className="bg-black p-1.5 rounded-lg shadow-sm">
            <MapIcon color="#fff" size={20} />
          </div>

          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight">Soromaps</span>
            <span className="font-medium text-muted-foreground text-[10px] uppercase tracking-wider">
              Guia de Sorocaba
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="mx-0 w-full shrink-0 bg-black/30" />

      <SidebarContent className="gap-0">
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label} className="flex flex-col gap-0">
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent className="flex flex-col gap-0">
              {group.items.map(({ label, url, icon: Icon }) => (
                <SidebarRouteButton
                  key={url}
                  url={url}
                  name={label}
                  icon={<Icon size={16} />}
                />
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator className="mx-0 w-full shrink-0 bg-black/30" />

      <SidebarFooter className="shrink-0">
        <SidebarUserSection
          userName={name}
          email={email}
          initials={initials}
          avatarUrl={avatarUrl}
          role={role}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
