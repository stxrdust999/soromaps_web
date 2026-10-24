"use client";

import {
  ChevronRightIcon,
  LogOutIcon,
  PencilIcon,
  UserCircleIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";
import { FeedbackDialog } from "./feedback-dialog";

interface SidebarUserSectionProps {
  userName?: string;
  email?: string;
  initials?: string;
  className?: string;
  hasChevron?: boolean;
}

export function SidebarUserSection({
  userName,
  email,
  initials,
  className,
}: SidebarUserSectionProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <Popover>
      <PopoverTrigger>
        <SidebarUserInfoSection
          userName={userName}
          email={email}
          initials={initials}
          className={className}
          hasChevron
        />
      </PopoverTrigger>

      <PopoverContent side="right" className="mx-3 p-0 flex flex-col gap-0">
        {/* upper section */}
        <SidebarUserInfoSection
          className="p-3"
          userName={userName}
          email={email}
          initials={initials}
        />

        <Separator className="m-0 p-0 w-full" />

        {/* main content/lower section */}
        <div className="pt-3 pb-1">
          <Button
            variant={"ghost"}
            className="flex flex-row gap-3 w-full justify-start"
            onClick={() => router.push("/profile")}
          >
            <PencilIcon />
            <p>Editar perfil</p>
          </Button>

          <Button
            variant={"ghost"}
            className="flex flex-row gap-3 w-full justify-start"
            onClick={() => router.push("/profile")}
          >
            <UserCircleIcon />
            <p>Gerenciar Conta</p>
          </Button>

          <FeedbackDialog />

          <Button
            onClick={handleLogout}
            variant={"ghost"}
            className="flex flex-row gap-3 w-full justify-start"
          >
            <LogOutIcon />
            <p>Sair</p>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SidebarUserInfoSection({
  className,
  userName,
  email,
  initials,
  hasChevron = false,
}: SidebarUserSectionProps) {
  return (
    <div
      className={cn("flex flex-row items-center gap-2 px-2 py-1", className)}
    >
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarFallback className="rounded-lg bg-black text-white">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold text-foreground">
          {userName}
        </span>
        <span className="truncate text-xs text-muted-foreground">{email}</span>
      </div>

      {hasChevron && (
        <ChevronRightIcon className="ml-auto size-4 text-zinc-400" />
      )}
    </div>
  );
}
