import { redirect } from "next/navigation";

interface LegacyNewStoryPageProps {
  searchParams: Promise<{ draft?: string; pautaId?: string }>;
}

/**
 * Redireciona a rota legada em português para a rota padronizada em inglês `/community/new-story`.
 */
export default async function LegacyNewStoryPage({
  searchParams,
}: LegacyNewStoryPageProps) {
  const { draft, pautaId } = await searchParams;
  const targetDraft = draft ?? pautaId;
  const targetUrl = targetDraft
    ? `/community/new-story?draft=${encodeURIComponent(targetDraft)}`
    : "/community/new-story";

  redirect(targetUrl);
}
