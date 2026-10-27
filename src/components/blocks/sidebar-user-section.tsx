"use client";

import {
  ChevronRightIcon,
  LaptopIcon,
  LogOutIcon,
  MoonIcon,
  PencilIcon,
  SunIcon,
  UserCircleIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import * as React from "react";
import { logoutAction } from "@/actions/auth";
import {
  AnimatedThemeToggler,
  applyDocumentThemeClass,
  runThemeViewTransition,
} from "@/components/ui/animated-theme-toggler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { FeedbackDialog } from "./feedback-dialog";

interface SidebarUserSectionProps {
  userName?: string;
  email?: string;
  initials?: string;
  role?: string;
  avatarUrl?: string;
  className?: string;
}

/**
 * Seção de usuário da sidebar contendo gatilho interativo e menu popover com perfil, tema e ações rápidas.
 */
export function SidebarUserSection({
  userName = "Explorador",
  email = "",
  initials,
  role = "explorer",
  avatarUrl,
  className,
}: SidebarUserSectionProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const fallbackInitials = initials ?? userName.charAt(0).toUpperCase();
  const isAdmin = role?.toLowerCase() === "admin";
  const userIdentifier = email || userName;

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleThemeSelect = (
    nextTheme: "light" | "dark" | "system",
    mouseEvent: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (theme === nextTheme)
      return;

    runThemeViewTransition(
      mouseEvent.currentTarget,
      () => {
        applyDocumentThemeClass(nextTheme);
        setTheme(nextTheme);
      },
      { variant: "circle", duration: 450 },
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-state={isOpen ? "open" : "closed"}
          className={cn(
            "group flex w-full items-center gap-3 rounded-xl p-2 text-left outline-hidden transition-all duration-200 ease-out",
            "hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground active:scale-[0.99]",
            "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1",
            "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
            className,
          )}
        >
          <Avatar
            identifier={userIdentifier}
            className="size-9 shrink-0 rounded-xl transition-transform duration-200 group-hover:scale-105"
          >
            <AvatarImage
              src={avatarUrl}
              alt={userName}
              className="rounded-xl"
            />
            <AvatarFallback
              identifier={userIdentifier}
              className="rounded-xl bg-primary/10 text-xs font-semibold text-primary"
            >
              {fallbackInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-1 flex-col text-left leading-tight">
            <span className="truncate text-sm font-semibold tracking-tight text-foreground">
              {userName}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {email || "explorador@soromaps.com"}
            </span>
          </div>

          <ChevronRightIcon
            aria-hidden="true"
            className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-data-[state=open]:rotate-90"
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="end"
        sideOffset={12}
        className="w-72 rounded-2xl border border-border/60 bg-popover/95 p-3 shadow-xl backdrop-blur-md"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-2.5">
            <Avatar
              identifier={userIdentifier}
              className="size-11 shrink-0 rounded-xl ring-2 ring-border/50"
            >
              <AvatarImage
                src={avatarUrl}
                alt={userName}
                className="rounded-xl"
              />
              <AvatarFallback
                identifier={userIdentifier}
                className="rounded-xl bg-primary/10 text-sm font-bold text-primary"
              >
                {fallbackInitials}
              </AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-1 flex-col text-left">
              <span className="truncate text-sm font-bold tracking-tight text-foreground">
                {userName}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {email || "Conta conectada"}
              </span>

              <div className="mt-1">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    isAdmin
                      ? "border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "border border-primary/20 bg-primary/10 text-primary",
                  )}
                >
                  {isAdmin ? "Administrador" : "Explorador"}
                </span>
              </div>
            </div>
          </div>

          {/* appearance - section */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-border/40 bg-muted/40 p-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Aparência
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-muted-foreground/80">
                  {isMounted
                    ? theme === "system"
                      ? "Sistema"
                      : theme === "dark"
                        ? "Escuro"
                        : "Claro"
                    : ""}
                </span>
                <AnimatedThemeToggler className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 rounded-lg bg-background/80 p-0.5">
              <button
                type="button"
                onClick={(mouseEvent) =>
                  handleThemeSelect("light", mouseEvent)
                }
                className={cn(
                  "flex h-7 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all duration-200",
                  isMounted && theme === "light"
                    ? "bg-accent text-accent-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title="Tema claro"
              >
                <SunIcon className="size-3.5" />
                <span>Claro</span>
              </button>

              <button
                type="button"
                onClick={(mouseEvent) => handleThemeSelect("dark", mouseEvent)}
                className={cn(
                  "flex h-7 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all duration-200",
                  isMounted && theme === "dark"
                    ? "bg-accent text-accent-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title="Tema escuro"
              >
                <MoonIcon className="size-3.5" />
                <span>Escuro</span>
              </button>

              <button
                type="button"
                onClick={(mouseEvent) =>
                  handleThemeSelect("system", mouseEvent)
                }
                className={cn(
                  "flex h-7 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all duration-200",
                  isMounted && theme === "system"
                    ? "bg-accent text-accent-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title="Tema do sistema"
              >
                <LaptopIcon className="size-3.5" />
                <span>Auto</span>
              </button>
            </div>
          </div>

          <Separator className="bg-border/60" />

          <div className="flex flex-col gap-0.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleNavigate("/profile")}
              className="h-9 w-full justify-start gap-2.5 rounded-xl px-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground active:scale-[0.99]"
            >
              <PencilIcon className="size-4 shrink-0 text-muted-foreground" />
              <span>Meu Perfil</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => handleNavigate("/profile/settings")}
              className="h-9 w-full justify-start gap-2.5 rounded-xl px-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground active:scale-[0.99]"
            >
              <UserCircleIcon className="size-4 shrink-0 text-muted-foreground" />
              <span>Gerenciar Conta</span>
            </Button>

            <FeedbackDialog />
          </div>

          <Separator className="bg-border/60" />

          <div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleLogout}
              className="h-9 w-full justify-start gap-2.5 rounded-xl px-2.5 text-sm font-medium text-destructive transition-all duration-200 hover:bg-destructive/10 hover:text-destructive active:scale-[0.99]"
            >
              <LogOutIcon className="size-4 shrink-0" />
              <span>Sair da conta</span>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
