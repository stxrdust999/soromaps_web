import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { StoryEditorWorkspace } from "./_components/story-editor-workspace";

/**
 * Tela cheia de criação, edição e pré-visualização de pautas editoriais para a comunidade.
 * Restrita exclusivamente a administradores.
 */
export default async function NovaPautaPage() {
  const session = await getSession();

  const rawRole =
    session?.role ??
    // @ts-expect-error compatibilidade caso o payload venha aninhado como user.role
    session?.user?.role;

  const isAdmin =
    typeof rawRole === "string"
      ? rawRole.trim().toLowerCase() === "admin"
      : rawRole === 1;

  if (!isAdmin) {
    redirect("/community");
  }

  return <StoryEditorWorkspace authorName={session?.name ?? "Equipe Editorial"} />;
}
