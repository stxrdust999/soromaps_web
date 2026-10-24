import { Suspense } from "react";

import { FEED_MUTES_TAG } from "@/constants/reports";
import { CURRENT_USER_TAG } from "@/constants/users";
import { listFeedMutes } from "@/http/feed/feed";
import { getCurrentUser } from "@/http/users/users";
import { ProfileSettingsContent } from "./_components/profile-settings-content";

/**
 * Página de configurações do explorador integrada à API com divisão por abas (Perfil, Conta, Preferências).
 */
export default async function ProfileSettingsPage() {
  const promises = {
    userPromise: getCurrentUser({ next: { tags: [CURRENT_USER_TAG] } }),
    mutesPromise: listFeedMutes({ next: { tags: [FEED_MUTES_TAG] } }),
  };

  return (
    <Suspense
      fallback={
        <div className="h-64 rounded-xl border border-dashed animate-pulse bg-muted/20" />
      }
    >
      <ProfileSettingsContent promises={promises} />
    </Suspense>
  );
}
