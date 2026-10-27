"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  ExternalLinkIcon,
  EyeIcon,
  Loader2Icon,
  MapPinIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  SparklesIcon,
  StarIcon,
  Trash2Icon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import {
  createStoryAction,
  generateStoryDraftAction,
  type PlaceStoryItem,
  searchPlacesForStoryAction,
  updateStoryAction,
} from "@/actions/stories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sparkles } from "@/components/ui/sparkles";
import { Textarea } from "@/components/ui/textarea";
import type { StoryDetailDto } from "@/http/api.schemas";
import { responseToast } from "@/lib/toaster";
import { cn } from "@/lib/utils";
import { slugify } from "@/utils/formatters/slugify";
import {
  type GenerateStorySchema,
  generateStorySchema,
  MAX_PLACES,
} from "@/validations/stories";

interface StoryPlaceDraftInput {
  placeId: string;
  placeName: string;
  categoryName: string;
  neighborhood: string;
  coverPhotoUrl: string | null;
  angleTitle: string;
  bodyText: string;
  localTip: string;
}

interface StoryEditorWorkspaceProps {
  authorName: string;
  initialStory?: StoryDetailDto | null;
}

/**
 * Avalia se a origem da pauta foi gerada por inteligência artificial, suportando serialização em string camelCase ou numérica.
 */
function isStoryAiGenerated(origin: string | number | undefined): boolean {
  return (
    String(origin).toLowerCase() === "aigenerated" || Number(origin) === 1
  );
}

/**
 * Workspace de tela cheia para criação e preview em tempo real de pautas editoriais.
 */
export function StoryEditorWorkspace({
  authorName,
  initialStory,
}: StoryEditorWorkspaceProps) {
  const router = useRouter();
  const isEditing = Boolean(initialStory?.id);

  const [modelo, setModelo] = useState<string | null>(
    isStoryAiGenerated(initialStory?.origin) ? "Gemini" : null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceStoryItem[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<PlaceStoryItem[]>(() => {
    if (!initialStory?.places) return [];
    return initialStory.places.map((place) => ({
      id: place.placeId,
      nome: place.placeName,
      bairro: place.neighborhood,
      categoria: place.category.name,
      nota: 5,
      avaliacoes: 0,
      fotoUrl: place.coverPhotoUrl ?? null,
      sobre: place.bodyText,
    }));
  });
  const [isSearching, setIsSearching] = useState(false);

  const [slug, setSlug] = useState(initialStory?.slug ?? "");
  const [title, setTitle] = useState(initialStory?.title ?? "");
  const [subtitle, setSubtitle] = useState(initialStory?.subtitle ?? "");
  const [neighborhood, setNeighborhood] = useState(
    initialStory?.neighborhood ?? "",
  );
  const [introText, setIntroText] = useState(initialStory?.introText ?? "");
  const [closingText, setClosingText] = useState(
    initialStory?.closingText ?? "",
  );
  const [placesContent, setPlacesContent] = useState<StoryPlaceDraftInput[]>(
    () => {
      if (!initialStory?.places) return [];
      return initialStory.places.map((place) => ({
        placeId: place.placeId,
        placeName: place.placeName,
        categoryName: place.category.name,
        neighborhood: place.neighborhood,
        coverPhotoUrl: place.coverPhotoUrl ?? null,
        angleTitle: place.angleTitle,
        bodyText: place.bodyText,
        localTip: place.localTip ?? "",
      }));
    },
  );

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const form = useForm<GenerateStorySchema>({
    resolver: zodResolver(generateStorySchema),
    defaultValues: {
      tema: initialStory?.title ?? "",
      localIds: initialStory?.places.map((place) => place.placeId) ?? [],
    },
  });

  const { isSubmitting: isGenerating } = form.formState;
  const isAiActive = Boolean(modelo) || isGenerating;
  const selectedIds = form.watch("localIds");

  useEffect(() => {
    if (!initialStory) return;

    setTitle(initialStory.title);
    setSlug(initialStory.slug);
    setSubtitle(initialStory.subtitle);
    setNeighborhood(initialStory.neighborhood ?? "");
    setIntroText(initialStory.introText);
    setClosingText(initialStory.closingText ?? "");
    setModelo(isStoryAiGenerated(initialStory.origin) ? "Gemini" : null);

    const nextPlaces: PlaceStoryItem[] = initialStory.places.map((place) => ({
      id: place.placeId,
      nome: place.placeName,
      bairro: place.neighborhood,
      categoria: place.category.name,
      nota: 5,
      avaliacoes: 0,
      fotoUrl: place.coverPhotoUrl ?? null,
      sobre: place.bodyText,
    }));
    setSelectedPlaces(nextPlaces);

    const nextContent: StoryPlaceDraftInput[] = initialStory.places.map(
      (place) => ({
        placeId: place.placeId,
        placeName: place.placeName,
        categoryName: place.category.name,
        neighborhood: place.neighborhood,
        coverPhotoUrl: place.coverPhotoUrl ?? null,
        angleTitle: place.angleTitle,
        bodyText: place.bodyText,
        localTip: place.localTip ?? "",
      }),
    );
    setPlacesContent(nextContent);

    form.setValue(
      "localIds",
      initialStory.places.map((place) => place.placeId),
    );
    form.setValue("tema", initialStory.title);
  }, [initialStory, form]);

  const loadPlaces = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const results = await searchPlacesForStoryAction(query);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPlaces(searchQuery);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, loadPlaces]);

  function handleAddPlace(place: PlaceStoryItem) {
    if (selectedIds.includes(place.id) || selectedIds.length >= MAX_PLACES)
      return;

    const nextIds = [...selectedIds, place.id];
    form.setValue("localIds", nextIds, { shouldValidate: true });
    setSelectedPlaces((current) => [...current, place]);

    if (!neighborhood && place.bairro) setNeighborhood(place.bairro);

    setPlacesContent((current) => {
      if (current.some((item) => item.placeId === place.id)) return current;
      return [
        ...current,
        {
          placeId: place.id,
          placeName: place.nome,
          categoryName: place.categoria,
          neighborhood: place.bairro,
          coverPhotoUrl: place.fotoUrl,
          angleTitle: `Destaque: ${place.nome}`,
          bodyText: place.sobre || "",
          localTip: "",
        },
      ];
    });
  }

  function handleRemovePlace(id: string) {
    const nextIds = selectedIds.filter((item) => item !== id);
    form.setValue("localIds", nextIds, { shouldValidate: true });
    setSelectedPlaces((current) => current.filter((item) => item.id !== id));
    setPlacesContent((current) =>
      current.filter((item) => item.placeId !== id),
    );
  }

  async function onGenerateDraft(data: GenerateStorySchema) {
    const formData = new FormData();
    formData.set("tema", data.tema);
    for (const id of data.localIds) formData.append("localIds", String(id));

    const state = await generateStoryDraftAction(formData);

    if (!state.success || !state.draft) {
      responseToast.error({
        title: "Não foi possível gerar a sugestão",
        description: state.message,
      });
      return;
    }

    const { draft } = state;
    setModelo(state.modelo ?? null);

    setTitle(draft.titulo);
    setSlug(slugify(draft.titulo));
    setSubtitle(draft.chamada);

    if (selectedPlaces.length === 0) {
      const introParagraphs = draft.corpo.slice(0, -1);
      const closingParagraph =
        draft.corpo.length > 1 ? draft.corpo[draft.corpo.length - 1] : "";
      setIntroText(
        introParagraphs.length > 0
          ? introParagraphs.join("\n\n")
          : (draft.corpo[0] ?? ""),
      );
      setClosingText(closingParagraph);
      setPlacesContent([]);
    } else {
      const intro = draft.corpo[0] ?? "";
      const closing =
        draft.corpo.length > 1 ? draft.corpo[draft.corpo.length - 1] : "";
      setIntroText(intro);
      setClosingText(closing);

      const nextPlacesContent: StoryPlaceDraftInput[] = selectedPlaces.map(
        (place, index) => {
          const paragraph =
            draft.corpo[index + 1] || draft.corpo[1] || place.sobre || "";
          return {
            placeId: place.id,
            placeName: place.nome,
            categoryName: place.categoria,
            neighborhood: place.bairro,
            coverPhotoUrl: place.fotoUrl,
            angleTitle: `Por que ir no ${place.nome}`,
            bodyText: paragraph,
            localTip: "",
          };
        },
      );

      setPlacesContent(nextPlacesContent);
    }

    responseToast.success({
      title: "Rascunho gerado com sucesso!",
      description:
        "Acompanhe o preview ao lado em tempo real e ajuste o texto.",
    });
  }

  function updatePlaceContent(
    placeId: string,
    field: "angleTitle" | "bodyText" | "localTip",
    value: string,
  ) {
    setPlacesContent((current) =>
      current.map((item) =>
        item.placeId === placeId ? { ...item, [field]: value } : item,
      ),
    );
  }

  async function handleSaveStory(publishImmediately: boolean) {
    if (!title.trim()) {
      responseToast.error({
        title: "Título obrigatório",
        description: "Preencha o título da pauta antes de continuar.",
      });
      return;
    }

    if (!introText.trim() || introText.trim().length < 20) {
      responseToast.error({
        title: "Introdução muito curta",
        description: "Escreva ao menos 20 caracteres na introdução.",
      });
      return;
    }

    const generatedSlug = slug.trim() ? slugify(slug) : slugify(title);

    if (publishImmediately) setIsPublishing(true);
    else setIsSavingDraft(true);

    try {
      const placesPayload = placesContent.map((place) => ({
        placeId: place.placeId,
        angleTitle: place.angleTitle.trim() || `Destaque: ${place.placeName}`,
        bodyText:
          place.bodyText.trim().length >= 20
            ? place.bodyText.trim()
            : `Espaço especial da comunidade: ${place.placeName}. Local imperdível para conhecer.`,
        localTip: place.localTip.trim() || null,
      }));

      const basePayload = {
        slug: generatedSlug,
        title: title.trim(),
        subtitle: subtitle.trim() || title.trim(),
        neighborhood: neighborhood.trim() || null,
        introText: introText.trim(),
        closingText: closingText.trim() || null,
        publishImmediately,
        places: placesPayload,
      };

      const response =
        isEditing && initialStory?.id
          ? await updateStoryAction({ id: initialStory.id, ...basePayload })
          : await createStoryAction(basePayload);

      if (!response.success) {
        responseToast.error({
          title: isEditing ? "Erro ao atualizar pauta" : "Erro ao salvar pauta",
          description: response.message,
        });
        return;
      }

      responseToast.success({
        title: publishImmediately
          ? isEditing
            ? "Pauta atualizada e publicada!"
            : "Pauta publicada!"
          : isEditing
            ? "Rascunho atualizado!"
            : "Rascunho salvo!",
        description: response.message,
      });

      if (response.storySlug) router.push(`/pautas/${response.storySlug}`);
      else router.push("/community");
    } finally {
      setIsPublishing(false);
      setIsSavingDraft(false);
    }
  }

  async function handleCopyContent() {
    if (!title && !introText) return;

    const fullContent = [
      title,
      subtitle,
      introText,
      ...placesContent.map(
        (place) =>
          `### ${place.placeName} - ${place.angleTitle}\n${place.bodyText}${
            place.localTip ? `\nDica local: ${place.localTip}` : ""
          }`,
      ),
      closingText,
    ]
      .filter(Boolean)
      .join("\n\n");

    await navigator.clipboard.writeText(fullContent);
    responseToast.success({
      title: "Conteúdo copiado para a área de transferência",
    });
  }

  const previewCoverPhoto = useMemo(() => {
    const firstWithPhoto = selectedPlaces.find((place) =>
      Boolean(place.fotoUrl),
    );
    return (
      firstWithPhoto?.fotoUrl ??
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
    );
  }, [selectedPlaces]);

  const readingTimeMinutes = useMemo(() => {
    const totalWords = [
      title,
      subtitle,
      introText,
      ...placesContent.map(
        (place) => `${place.angleTitle} ${place.bodyText} ${place.localTip}`,
      ),
      closingText,
    ]
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;

    return Math.max(2, Math.ceil(totalWords / 160));
  }, [title, subtitle, introText, placesContent, closingText]);

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
      {/* topbar - actions */}
      <header className="flex min-h-14 shrink-0 items-center justify-between gap-4 border-border/60 border-b bg-background/95 px-6 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/community">
              <ArrowLeftIcon className="mr-1.5 size-4" />
              Voltar para Comunidade
            </Link>
          </Button>
          <div className="h-4 w-px bg-border/60" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Editor de Pautas</span>
            <Badge variant="outline" className="text-xs">
              {isEditing ? "Edição de Rascunho" : "Preview em Tempo Real"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyContent}
            disabled={!title && !introText}
          >
            <CopyIcon className="size-4" />
            Copiar texto
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleSaveStory(false)}
            disabled={isSavingDraft || isPublishing || !title.trim()}
          >
            {isSavingDraft && (
              <Loader2Icon className="mr-1.5 size-4 animate-spin" />
            )}
            {isEditing ? "Atualizar Rascunho" : "Salvar Rascunho"}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleSaveStory(true)}
            disabled={isPublishing || isSavingDraft || !title.trim()}
          >
            {isPublishing ? (
              <Loader2Icon className="mr-1.5 size-4 animate-spin" />
            ) : (
              <SendIcon className="mr-1.5 size-4" />
            )}
            {isEditing ? "Salvar e Publicar" : "Publicar Pauta"}
          </Button>
        </div>
      </header>

      {/* split screen - section */}
      <div className="flex flex-1 overflow-hidden">
        {/* left column - editor */}
        <div className="flex-1 space-y-6 overflow-y-auto border-r p-6 lg:max-w-[55%]">
          {/* ai suggestion & places selection - section */}
          <div className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">
                1. Roteiro & Assistente de IA
              </span>
              <Badge variant="outline" className="text-xs">
                {selectedIds.length} de {MAX_PLACES} locais
              </Badge>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onGenerateDraft)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="tema"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tema do Roteiro</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex.: cafés aconchegantes com wi-fi no centro de Sorocaba"
                        />
                      </FormControl>
                      <FormDescription>
                        Descreva o recorte. A IA usará os fatos reais do mapa ou
                        o tema da cidade para rascunhar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* selected places - field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>
                      Locais da pauta (opcional) — {selectedPlaces.length} de{" "}
                      {MAX_PLACES}
                    </FormLabel>
                    <span className="text-muted-foreground text-xs">
                      Opcional (até {MAX_PLACES})
                    </span>
                  </div>

                  {selectedPlaces.length === 0 ? (
                    <p className="text-muted-foreground text-xs italic">
                      Adicione locais se desejar destacar ou comparar pontos
                      específicos no artigo.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {selectedPlaces.map((place) => (
                        <div
                          key={place.id}
                          className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-2 text-xs"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            {place.fotoUrl ? (
                              <Image
                                src={place.fotoUrl}
                                alt={place.nome}
                                width={36}
                                height={36}
                                className="size-9 flex-none rounded-md object-cover"
                              />
                            ) : (
                              <div className="flex size-9 flex-none items-center justify-center rounded-md bg-muted text-muted-foreground">
                                <MapPinIcon className="size-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                {place.nome}
                              </p>
                              <p className="truncate text-[11px] text-muted-foreground">
                                {place.categoria} · {place.bairro}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePlace(place.id)}
                            className="ml-2 flex-none rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                            title="Remover local"
                          >
                            <XIcon className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* search input - field */}
                <div className="space-y-2">
                  <FormLabel>Buscar Locais no Catálogo</FormLabel>
                  <div className="relative">
                    <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Busque por nome, bairro ou categoria (tolerante a acentos e erros)..."
                      className="pr-9 pl-9"
                    />
                    {isSearching ? (
                      <Loader2Icon className="-translate-y-1/2 absolute top-1/2 right-3 size-4 animate-spin text-muted-foreground" />
                    ) : (
                      searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground hover:text-foreground"
                        >
                          <XIcon className="size-4" />
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* places grid selection - section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-muted-foreground text-xs">
                    <span>
                      {searchQuery
                        ? "Resultados correspondentes:"
                        : "Locais sugeridos:"}
                    </span>
                    <span>{searchResults.length} disponíveis</span>
                  </div>

                  <div className="grid max-h-60 grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
                    {searchResults.map((place) => {
                      const isSelected = selectedIds.includes(place.id);
                      return (
                        <div
                          key={place.id}
                          className={cn(
                            "flex items-center justify-between rounded-xl border p-2.5 text-xs transition-all",
                            isSelected
                              ? "border-primary bg-primary/10 shadow-xs"
                              : "border-border bg-card hover:border-primary/40 hover:bg-muted/30",
                          )}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            {place.fotoUrl ? (
                              <Image
                                src={place.fotoUrl}
                                alt={place.nome}
                                width={44}
                                height={44}
                                className="size-11 flex-none rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <MapPinIcon className="size-5" />
                              </div>
                            )}

                            <div className="min-w-0 space-y-0.5">
                              <p className="truncate font-medium text-foreground">
                                {place.nome}
                              </p>
                              <p className="truncate text-[11px] text-muted-foreground">
                                {place.categoria} · {place.bairro}
                              </p>
                              <div className="flex items-center gap-1 font-medium text-[11px] text-amber-500">
                                <StarIcon className="size-3 fill-amber-500" />
                                <span>{place.nota.toFixed(1)}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  ({place.avaliacoes})
                                </span>
                              </div>
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant={isSelected ? "secondary" : "outline"}
                            className="ml-2 h-8 flex-none px-2.5"
                            disabled={
                              !isSelected && selectedIds.length >= MAX_PLACES
                            }
                            onClick={() =>
                              isSelected
                                ? handleRemovePlace(place.id)
                                : handleAddPlace(place)
                            }
                          >
                            {isSelected ? (
                              <>
                                <CheckIcon className="size-3.5 text-primary" />
                                Escolhido
                              </>
                            ) : (
                              <>
                                <PlusIcon className="size-3.5" />
                                Adicionar
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-muted-foreground text-xs">
                    Clique para gerar com Gemini ou escreva o texto abaixo.
                  </div>

                  <div className="relative inline-flex items-center">
                    {isGenerating && (
                      <div className="absolute -inset-1 animate-pulse rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 opacity-75 blur-xs" />
                    )}
                    <Button
                      type="submit"
                      disabled={isGenerating}
                      className={cn(
                        "relative transition-all",
                        isGenerating &&
                          "border-transparent bg-zinc-900 text-white shadow-indigo-500/25 shadow-lg dark:bg-zinc-100 dark:text-zinc-900",
                      )}
                    >
                      {isGenerating ? (
                        <Sparkles className="mr-2">
                          <Loader2Icon className="size-4 animate-spin text-primary-foreground" />
                        </Sparkles>
                      ) : (
                        <SparklesIcon className="mr-1.5 size-4" />
                      )}
                      {title ? "Regerar com IA" : "Gerar com IA"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>

          {/* editorial content form - section */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base">
                  2. Conteúdo da Matéria
                </h3>
                <p className="text-muted-foreground text-xs">
                  Modifique os textos diretamente. O preview à direita refletirá
                  as alterações instantaneamente.
                </p>
              </div>

              {modelo && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <SparklesIcon className="size-3" />
                  Rascunho por {modelo}
                </Badge>
              )}
            </div>

            {modelo && (
              <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-warning text-xs">
                <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
                <span>
                  Texto sugerido por modelo de inteligência artificial.
                  Verifique afirmações e fatos antes de publicar.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="font-medium text-xs">Título da Pauta *</label>
                <Input
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    if (!slug) setSlug(slugify(event.target.value));
                  }}
                  placeholder="Ex.: 4 cafés com mesas tranquilas e wi-fi rápido"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-xs">Slug URL</label>
                <Input
                  value={slug}
                  onChange={(event) => setSlug(slugify(event.target.value))}
                  placeholder="ex.: 4-cafes-tranquilos-wifi"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="font-medium text-xs">
                  Subtítulo / Chamada *
                </label>
                <Input
                  value={subtitle}
                  onChange={(event) => setSubtitle(event.target.value)}
                  placeholder="Resumo que aparece no feed da comunidade"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-xs">
                  Bairro ou Região (Opcional)
                </label>
                <Input
                  value={neighborhood}
                  onChange={(event) => setNeighborhood(event.target.value)}
                  placeholder="Ex.: Centro / Campolim"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-xs">
                Introdução da Pauta *
              </label>
              <Textarea
                rows={3}
                value={introText}
                onChange={(event) => setIntroText(event.target.value)}
                placeholder="Apresente o roteiro e o recorte editorial escolhido..."
              />
            </div>

            {/* places specific cards editing - section */}
            {placesContent.length > 0 && (
              <div className="space-y-3 pt-2">
                <label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  Destaques dos Locais da Pauta
                </label>

                {placesContent.map((place, index) => (
                  <div
                    key={place.placeId}
                    className="space-y-3 rounded-lg border border-border/80 bg-muted/20 p-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-xs">
                        #{index + 1} {place.placeName}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-destructive text-xs hover:bg-destructive/10"
                        onClick={() => handleRemovePlace(place.placeId)}
                      >
                        <Trash2Icon className="mr-1 size-3.5" />
                        Remover
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Input
                        value={place.angleTitle}
                        onChange={(event) =>
                          updatePlaceContent(
                            place.placeId,
                            "angleTitle",
                            event.target.value,
                          )
                        }
                        placeholder="Título do destaque (ex.: O melhor espresso da zona sul)"
                        className="text-xs"
                      />
                      <Textarea
                        rows={2}
                        value={place.bodyText}
                        onChange={(event) =>
                          updatePlaceContent(
                            place.placeId,
                            "bodyText",
                            event.target.value,
                          )
                        }
                        placeholder="Texto sobre o local..."
                        className="text-xs"
                      />
                      <Input
                        value={place.localTip}
                        onChange={(event) =>
                          updatePlaceContent(
                            place.placeId,
                            "localTip",
                            event.target.value,
                          )
                        }
                        placeholder="Dica local (opcional, ex.: peça a mesa perto da janela)"
                        className="text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-medium text-xs">
                Conclusão ou Dica Final (Opcional)
              </label>
              <Textarea
                rows={2}
                value={closingText}
                onChange={(event) => setClosingText(event.target.value)}
                placeholder="Fechamento do roteiro ou sugestão aos exploradores..."
              />
            </div>
          </div>
        </div>

        {/* right column - live preview */}
        <div className="relative hidden flex-1 flex-col overflow-hidden bg-muted/10 lg:flex">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                x: ["-4%", "14%", "-6%", "-4%"],
                y: ["-2%", "12%", "4%", "-2%"],
                scale: [1, 1.32, 1.08, 1],
              }}
              transition={{
                duration: 24,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className={cn(
                "absolute -top-[8%] -left-[6%] h-[42vw] max-h-[560px] w-[42vw] max-w-[560px] rounded-full transition-[background-color,opacity,filter] transition-colors transition-opacity duration-1000",
                isAiActive
                  ? "opacity-55 blur-[110px] dark:opacity-45"
                  : "opacity-[0.07] blur-[120px] dark:opacity-[0.09]",
              )}
              style={{
                backgroundColor: isAiActive
                  ? "oklch(0.74 0.16 255)"
                  : "var(--primary)",
              }}
            />

            <motion.div
              animate={{
                x: ["6%", "-14%", "4%", "6%"],
                y: ["4%", "-12%", "-4%", "4%"],
                scale: [1.18, 0.95, 1.28, 1.18],
              }}
              transition={{
                duration: 28,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className={cn(
                "absolute -right-[6%] -bottom-[10%] h-[40vw] max-h-[540px] w-[40vw] max-w-[540px] rounded-full transition-[background-color,opacity,filter] transition-colors transition-opacity duration-1000",
                isAiActive
                  ? "opacity-50 blur-[115px] dark:opacity-40"
                  : "opacity-[0.06] blur-[125px] dark:opacity-[0.08]",
              )}
              style={{
                backgroundColor: isAiActive
                  ? "oklch(0.62 0.24 285)"
                  : "var(--primary)",
              }}
            />

            <motion.div
              animate={{
                x: ["0%", "-16%", "8%", "0%"],
                y: ["6%", "-10%", "12%", "6%"],
                scale: [1.05, 1.38, 1.1, 1.05],
              }}
              transition={{
                duration: 32,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className={cn(
                "absolute top-[26%] -right-[4%] h-[36vw] max-h-[480px] w-[36vw] max-w-[480px] rounded-full transition-[background-color,opacity,filter] transition-colors transition-opacity duration-1000",
                isAiActive
                  ? "opacity-50 blur-[120px] dark:opacity-40"
                  : "opacity-[0.05] blur-[130px] dark:opacity-[0.07]",
              )}
              style={{
                backgroundColor: isAiActive
                  ? "oklch(0.78 0.18 330)"
                  : "var(--primary)",
              }}
            />

            <motion.div
              animate={{
                x: ["-6%", "15%", "-8%", "-6%"],
                y: ["4%", "-14%", "6%", "4%"],
                scale: [1, 1.3, 0.96, 1],
              }}
              transition={{
                duration: 36,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className={cn(
                "absolute bottom-[6%] left-[10%] h-[34vw] max-h-[460px] w-[34vw] max-w-[460px] rounded-full transition-[background-color,opacity,filter] transition-colors transition-opacity duration-1000",
                isAiActive
                  ? "opacity-45 blur-[115px] dark:opacity-35"
                  : "opacity-[0.06] blur-[125px] dark:opacity-[0.08]",
              )}
              style={{
                backgroundColor: isAiActive
                  ? "oklch(0.66 0.22 300)"
                  : "var(--primary)",
              }}
            />

            <motion.div
              animate={{
                x: ["8%", "-12%", "10%", "8%"],
                y: ["-8%", "10%", "-4%", "-8%"],
                scale: [1.1, 0.92, 1.25, 1.1],
              }}
              transition={{
                duration: 30,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className={cn(
                "absolute top-[42%] left-[18%] h-[32vw] max-h-[440px] w-[32vw] max-w-[440px] rounded-full transition-[background-color,opacity,filter] transition-colors transition-opacity duration-1000",
                isAiActive
                  ? "opacity-40 blur-[120px] dark:opacity-35"
                  : "opacity-[0.05] blur-[130px] dark:opacity-[0.07]",
              )}
              style={{
                backgroundColor: isAiActive
                  ? "oklch(0.70 0.20 240)"
                  : "var(--primary)",
              }}
            />

            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-1000",
                isAiActive
                  ? "opacity-35 dark:opacity-25"
                  : "opacity-15 dark:opacity-10",
              )}
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, rgba(255, 255, 255, 0.9) 1.25px, transparent 1.35px)",
                backgroundSize: "22px 22px",
              }}
            />
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto p-8">
            <div className="mx-auto w-full max-w-2xl space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  <EyeIcon className="size-4 text-primary" />
                  Pré-visualização Fiel da Página
                </div>
                <Badge variant="outline" className="text-[11px]">
                  /pautas/{slug || "slug-da-pauta"}
                </Badge>
              </div>

              {/* preview content card - component */}
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                {/* cover banner - section */}
                <div className="relative h-60 w-full overflow-hidden bg-muted">
                  <Image
                    src={previewCoverPhoto}
                    alt={title || "Capa da pauta"}
                    fill
                    sizes="(min-width: 1024px) 680px, 100vw"
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <div className="absolute right-4 bottom-4 left-4">
                    <Badge className="border-white/30 bg-white/20 text-white text-xs backdrop-blur-sm">
                      {neighborhood || "Sorocaba"}
                    </Badge>
                  </div>
                </div>

                {/* article body - section */}
                <div className="space-y-6 p-6">
                  <div className="space-y-3">
                    <h1 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
                      {title || "Título da pauta aparecerá aqui..."}
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {modelo ? (
                        <Badge variant="outline" className="gap-1">
                          <SparklesIcon className="size-3" />
                          Rascunho por {modelo}, revisado por {authorName}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Por {authorName}</Badge>
                      )}

                      <Badge variant="ghost">
                        <ClockIcon className="mr-1 size-3" />
                        {readingTimeMinutes} min de leitura
                      </Badge>

                      <Badge variant="ghost">Hoje</Badge>
                    </div>
                  </div>

                  <p className="text-base text-muted-foreground italic leading-relaxed">
                    {subtitle ||
                      "O subtítulo ou chamada da pauta aparecerá aqui sintetizando o roteiro..."}
                  </p>

                  <Separator />

                  {/* intro - section */}
                  <div className="space-y-4 text-foreground text-sm leading-relaxed">
                    <p className="text-pretty whitespace-pre-line">
                      {introText ||
                        "A introdução do roteiro aparecerá aqui apresentando a proposta da cidade..."}
                    </p>

                    {/* places stops - section */}
                    {placesContent.map((place, index) => (
                      <div
                        key={place.placeId}
                        className="mt-4 space-y-2 rounded-xl border border-border/80 bg-muted/20 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground text-sm">
                            {index + 1}. {place.placeName}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {place.categoryName} · {place.neighborhood}
                          </Badge>
                        </div>

                        {place.angleTitle && (
                          <p className="font-medium text-primary text-xs">
                            {place.angleTitle}
                          </p>
                        )}

                        <p className="text-pretty text-muted-foreground text-xs leading-relaxed">
                          {place.bodyText ||
                            "Detalhes e impressões sobre o local..."}
                        </p>

                        {place.localTip && (
                          <div className="flex items-start gap-1.5 rounded-md bg-amber-500/10 p-2 text-amber-600 text-xs dark:text-amber-400">
                            <span className="flex-none font-medium">
                              💡 Dica local:
                            </span>
                            <span>{place.localTip}</span>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* closing - section */}
                    {closingText && (
                      <p className="pt-2 text-pretty text-muted-foreground">
                        {closingText}
                      </p>
                    )}
                  </div>

                  {/* places cards summary - section */}
                  {selectedPlaces.length > 0 && (
                    <div className="space-y-3 border-t pt-4">
                      <h3 className="font-semibold text-sm">
                        Lugares desta pauta ({selectedPlaces.length})
                      </h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {selectedPlaces.map((place) => (
                          <Card
                            key={place.id}
                            size="sm"
                            className="border border-border bg-card/60"
                          >
                            <CardContent className="flex items-center justify-between gap-3 p-3">
                              <div className="flex min-w-0 items-center gap-2.5">
                                {place.fotoUrl ? (
                                  <Image
                                    src={place.fotoUrl}
                                    alt={place.nome}
                                    width={36}
                                    height={36}
                                    className="size-9 flex-none rounded-md object-cover"
                                  />
                                ) : (
                                  <div className="flex size-9 flex-none items-center justify-center rounded-md bg-muted text-muted-foreground">
                                    <MapPinIcon className="size-4" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-xs">
                                    {place.nome}
                                  </p>
                                  <p className="truncate text-[11px] text-muted-foreground">
                                    {place.categoria} · {place.bairro}
                                  </p>
                                </div>
                              </div>

                              <ExternalLinkIcon className="size-3.5 flex-none text-muted-foreground" />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
