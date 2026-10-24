"use client";

import { ClockIcon, Loader2Icon, SendIcon, SparklesIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";

import { publishStoryAction } from "@/actions/stories";
import { PageSection } from "@/components/blocks/page-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  getStoryBySlugResponse,
  listStoriesResponse,
} from "@/http/stories/stories";
import { responseToast } from "@/lib/toaster";
import type { StoryView } from "@/types/stories";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";

interface StoryArticleContentProps {
  slug: string;
  promises: {
    storyPromise: Promise<getStoryBySlugResponse>;
    storiesListPromise: Promise<listStoriesResponse>;
  };
}

/**
 * Conteúdo de uma pauta editorial hidratado via Streaming SSR (`use()` + `useMemo()`).
 */
export function StoryArticleContent({
  slug,
  promises,
}: StoryArticleContentProps) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const storyResponse = use(promises.storyPromise);
  const storiesListResponse = use(promises.storiesListPromise);

  const story = useMemo<StoryView | null>(() => {
    if (storyResponse.status !== 200) return null;
    const data = storyResponse.data;

    const bodyParagraphs = [
      data.introText,
      ...data.places
        .map((stop) => stop.bodyText)
        .filter((paragraph): paragraph is string => Boolean(paragraph)),
      ...(data.closingText ? [data.closingText] : []),
    ].filter((paragraph) => Boolean(paragraph));

    return {
      id: data.id,
      slug: data.slug,
      chapeu: data.neighborhood ?? "Sorocaba",
      titulo: data.title,
      chamada: data.subtitle,
      corpo: bodyParagraphs,
      fotoUrl:
        data.places[0]?.coverPhotoUrl ??
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      status: data.status === 1 ? "publicada" : "rascunho",
      origem: data.origin === 1 ? "ia" : "equipe",
      modelo: data.origin === 1 ? "Gemini" : undefined,
      revisadoPor: data.author.name,
      tempoLeitura: Math.max(2, Math.ceil(bodyParagraphs.length * 1.2)),
      diasAtras: Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(data.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      ),
      locais: data.places.map((stop) => ({
        id: stop.placeId,
        nome: stop.placeName,
        categoria: stop.category.name,
        bairro: stop.neighborhood,
      })),
    };
  }, [storyResponse]);

  const otherStories = useMemo(() => {
    if (storiesListResponse.status !== 200 || !storiesListResponse.data.items)
      return [];

    return storiesListResponse.data.items
      .filter((item) => item.slug !== slug)
      .slice(0, 4)
      .map((item) => ({
        slug: item.slug,
        titulo: item.title,
        tempoLeitura: 4,
      }));
  }, [storiesListResponse, slug]);

  if (!story) {
    return (
      <PageSection
        title="Pauta não encontrada"
        description="Não foi possível carregar esta pauta."
        className="mx-auto w-full max-w-3xl gap-6"
      >
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground text-sm">
          Esta pauta não existe ou ainda não foi publicada.
        </div>
      </PageSection>
    );
  }

  async function handlePublish() {
    if (!story) return;
    setIsPublishing(true);

    try {
      const response = await publishStoryAction(story.id, story.slug);
      if (!response.success) {
        responseToast.error({
          title: "Erro ao publicar pauta",
          description: response.message,
        });
        return;
      }

      responseToast.success({
        title: "Pauta publicada!",
        description: "Agora esta pauta está visível para toda a comunidade.",
      });

      router.refresh();
    } finally {
      setIsPublishing(false);
    }
  }

  const isDraft = story.status === "rascunho";

  return (
    <main className="flex flex-1 flex-col">
      {/* cover - banner */}
      <div className="relative h-64 w-full shrink-0 overflow-hidden bg-muted sm:h-80">
        <Image
          src={story.fotoUrl}
          alt={story.titulo}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      {isDraft && (
        <div className="mx-auto w-full max-w-3xl px-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-warning/15 p-4 text-warning border border-warning/30">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                ⚠️ Esta pauta está salva como rascunho e visível apenas para você (administrador).
              </span>
            </div>

            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isPublishing}
              className="shrink-0 font-medium"
            >
              {isPublishing ? (
                <Loader2Icon className="size-3.5 animate-spin mr-1.5" />
              ) : (
                <SendIcon className="size-3.5 mr-1.5" />
              )}
              Publicar agora
            </Button>
          </div>
        </div>
      )}

      {/* article - section */}
      <PageSection
        title={story.titulo}
        description={story.chapeu}
        className="mx-auto w-full max-w-3xl gap-6"
        subitems={
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {story.origem === "ia" ? (
              <Badge variant="outline">
                <SparklesIcon className="size-3" />
                Rascunho de {story.modelo ?? "IA"}, revisado por{" "}
                {story.revisadoPor ?? "a equipe"}
              </Badge>
            ) : (
              <Badge variant="outline">
                Por {story.revisadoPor ?? "Equipe"}
              </Badge>
            )}

            <Badge variant="ghost">
              <ClockIcon className="size-3" />
              {story.tempoLeitura} min de leitura
            </Badge>

            <Badge variant="ghost">{formatWaitingDays(story.diasAtras)}</Badge>
          </div>
        }
      >
        <p className="text-pretty text-lg text-muted-foreground leading-relaxed">
          {story.chamada}
        </p>

        {/* body - paragraphs */}
        <article className="flex flex-col gap-4">
          {story.corpo.map((paragraph, index) => (
            <p
              key={`${paragraph.slice(0, 24)}-${index}`}
              className="text-pretty leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </article>

        {/* stops - places */}
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-lg">Lugares desta pauta</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            {story.locais.map((place) => (
              <Card
                key={place.id}
                size="sm"
                className="group border border-border bg-card transition-all duration-150 hover:border-primary/60 hover:bg-muted/50 hover:shadow-sm"
              >
                <CardContent className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 flex-col">
                    <Link
                      href={`/places/${place.id}`}
                      className="truncate font-semibold text-sm transition-colors group-hover:text-primary"
                    >
                      {place.nome}
                    </Link>
                    <span className="truncate text-muted-foreground text-xs">
                      {place.categoria} · {place.bairro}
                    </span>
                  </span>

                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="shrink-0 transition-colors group-hover:border-primary/50 group-hover:text-primary"
                  >
                    <Link href={`/places/${place.id}`}>Ver local</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* related - stories */}
        {otherStories.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="font-semibold text-lg">Outras pautas</h2>

            <div className="flex flex-col gap-2">
              {otherStories.map((item) => (
                <Link
                  key={item.slug}
                  href={`/pautas/${item.slug}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <span className="truncate">{item.titulo}</span>
                  <span className="shrink-0 text-muted-foreground text-xs">
                    {item.tempoLeitura} min
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </PageSection>
    </main>
  );
}
