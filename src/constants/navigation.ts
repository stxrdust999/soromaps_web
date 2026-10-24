import {
  Award,
  ChartNoAxesColumn,
  Compass,
  Flag,
  Heart,
  LayoutList,
  MapIcon,
  MapPinned,
  MessageSquare,
  Settings,
  Shield,
  Tags,
  Trophy,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";

export interface NavItem {
  label: string;
  url: string;
  icon: React.ComponentType<{ size?: number }>;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Rotas comuns a todos os tipos de usuário. */
export const NAV_GROUP_GENERAL: NavGroup = {
  label: "Navegação",
  items: [
    { label: "Mapa Interativo", url: "/home", icon: MapIcon },
    { label: "Descobrir", url: "/discover", icon: Compass },
    { label: "Feed", url: "/feed", icon: LayoutList },
    { label: "Comunidade", url: "/community", icon: UsersRound },
  ],
};

/** Rotas pessoais do explorador — perfil, histórico e gamificação. */
export const NAV_GROUP_EXPLORER: NavGroup = {
  label: "Eu",
  items: [{ label: "Perfil", url: "/profile", icon: UserRound }],
};

/**
 * Abas de `/profile`.
 *
 * Eram cinco itens deste grupo até 2026-08-19: histórico, coleção, galeria e
 * placar respondem à mesma pergunta ("o que eu já fiz?") com recortes
 * diferentes, e recorte é aba, não rota. A ordem é a da leitura — o que
 * aconteceu, o que foi guardado, o que rendeu, o quanto somou.
 */
export const PROFILE_TABS: NavItem[] = [
  { label: "Visão geral", url: "/profile", icon: UserRound },
  { label: "Visitas", url: "/profile/visits", icon: MapPinned },
  { label: "Favoritos", url: "/profile/favorites", icon: Heart },
  { label: "Conquistas", url: "/profile/achievements", icon: Trophy },
  { label: "Estatísticas", url: "/profile/stats", icon: ChartNoAxesColumn },
  { label: "Configurações", url: "/profile/settings", icon: Settings },
];

/**
 * Rotas de administração da plataforma. As cinco primeiras são o topo do menu
 * no Figma; as três seguintes são os CRUDs que ficam atrás do "More".
 */
export const NAV_GROUP_ADMIN: NavGroup = {
  label: "Admin",
  items: [
    { label: "Dashboard", url: "/admin/dashboard", icon: ChartNoAxesColumn },
    { label: "Moderação", url: "/admin/moderation", icon: Shield },
    { label: "Denúncias e Feedback", url: "/admin/reports", icon: Flag },
    { label: "Categorias", url: "/admin/categories", icon: Tags },
    { label: "Conquistas", url: "/admin/achievements", icon: Award },
    { label: "Usuários", url: "/admin/users", icon: Users },
    { label: "Avaliações", url: "/admin/reviews", icon: MessageSquare },
  ],
};

/**
 * Ordem dos grupos na sidebar. Enquanto não há RBAC, todo usuário autenticado
 * vê todos os grupos — a filtragem por papel entra aqui.
 */
export const SIDEBAR_NAV: NavGroup[] = [
  NAV_GROUP_GENERAL,
  NAV_GROUP_EXPLORER,
  NAV_GROUP_ADMIN,
];
