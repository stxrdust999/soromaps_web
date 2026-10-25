"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SidebarRouteButtonProps {
  name: string;
  url: string;
  icon?: ReactNode;
}

/**
 * Botão de navegação da sidebar com indicador visual ativo, microinterações e transições fluidas.
 */
export function SidebarRouteButton({
  name,
  url,
  icon,
}: SidebarRouteButtonProps) {
  const pathname = usePathname();
  const isActive = pathname === url || pathname.startsWith(`${url}/`);

  return (
    <Link
      href={url}
      className={cn(
        "group relative flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium outline-hidden transition-all duration-200 ease-out",
        "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground active:scale-[0.99]",
      )}
    >
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute left-1.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-200"
        />
      )}

      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center transition-colors duration-200",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
        )}
      >
        {icon}
      </span>

      <span className="truncate tracking-tight">{name}</span>
    </Link>
  );
}
