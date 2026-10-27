import { redirect } from "next/navigation";

import type { StoryDetailDto } from "@/http/api.schemas";
import { getStoryBySlug } from "@/http/stories/stories";
import { getSession } from "@/lib/session";
import { StoryEditorWorkspace } from "./_components/story-editor-workspace";

interface NewStoryPageProps {
  searchParams: Promise<{ draft?: string; pautaId?: string }>;
}

/**
 * Tela cheia de criação, edição e pré-visualização de pautas editoriais para a comunidade.
 * Permite criar novas curadorias ou carregar e atualizar rascunhos existentes via parâmetro de busca.
 * Restrita exclusivamente a administradores.
 */
export default async function NewStoryPage({
  searchParams,
}: NewStoryPageProps) {
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

  const { draft, pautaId } = await searchParams;
  const storyIdOrSlug = draft ?? pautaId;
  let initialStory: StoryDetailDto | null = null;

  if (storyIdOrSlug) {
    try {
      const response = await getStoryBySlug(storyIdOrSlug);
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
