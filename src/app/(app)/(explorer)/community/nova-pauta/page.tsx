import { redirect } from "next/navigation";

import type { StoryDetailDto } from "@/http/api.schemas";
import { getStoryBySlug } from "@/http/stories/stories";
import { getSession } from "@/lib/session";
import { StoryEditorWorkspace } from "./_components/story-editor-workspace";

interface NovaPautaPageProps {
  searchParams: Promise<{ pautaId?: string }>;
}

/**
 * Tela cheia de criação, edição e pré-visualização de pautas editoriais para a comunidade.
 * Permite criar novas curadorias ou carregar e atualizar rascunhos existentes via pautaId.
 * Restrita exclusivamente a administradores.
 */
export default async function NovaPautaPage({
  searchParams,
}: NovaPautaPageProps) {
  const session = await getSession();

  const rawRole =
    session?.role ??
    // @ts-expect-error compatibilidade caso o payload venha aninhado como user.role
    session?.user?.role;

  const isAdmin =
    typeof rawRole === "string"
      ? rawRole.trim().toLowerCase() === "admin"
      : rawRole === 1;

  if (!isAdmin) redirect("/community");

  const { pautaId } = await searchParams;
  let initialStory: StoryDetailDto | null = null;

  if (pautaId) {
    try {
      const response = await getStoryBySlug(pautaId);
      if (response.status === 200) initialStory = response.data;
    } catch (error) {
      console.error("Erro ao carregar pauta inicial para edição:", error);
    }
  }

  return (
    <StoryEditorWorkspace
      authorName={session?.name ?? "Equipe Editorial"}
      initialStory={initialStory}
    />
  );
}
