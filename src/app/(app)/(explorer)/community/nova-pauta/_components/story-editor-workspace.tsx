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
import { Textarea } from "@/components/ui/textarea";
import { responseToast } from "@/lib/toaster";
import { cn } from "@/lib/utils";
import { slugify } from "@/utils/formatters/slugify";
import {
  type GenerateStorySchema,
  generateStorySchema,
  MAX_PLACES,
  MIN_PLACES,
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
}

/**
 * Workspace de tela cheia para criação e preview em tempo real de pautas editoriais.
 */
export function StoryEditorWorkspace({ authorName }: StoryEditorWorkspaceProps) {
  const router = useRouter();

  const [modelo, setModelo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceStoryItem[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<PlaceStoryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Campos do formulário editorial
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [introText, setIntroText] = useState("");
  const [closingText, setClosingText] = useState("");
  const [placesContent, setPlacesContent] = useState<StoryPlaceDraftInput[]>([]);

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const form = useForm<GenerateStorySchema>({
    resolver: zodResolver(generateStorySchema),
    defaultValues: { tema: "", localIds: [] },
  });

  const { isSubmitting: isGenerating } = form.formState;
  const selectedIds = form.watch("localIds");

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

    if (!neighborhood && place.bairro) {
      setNeighborhood(place.bairro);
    }

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

    const intro = draft.corpo[0] ?? "";
    const closing = draft.corpo.length > 1 ? draft.corpo[draft.corpo.length - 1] : "";
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
    responseToast.success({
      title: "Rascunho gerado com sucesso!",
      description: "Acompanhe o preview ao lado em tempo real e ajuste o texto.",
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

    if (selectedPlaces.length < MIN_PLACES) {
      responseToast.error({
        title: "Locais insuficientes",
        description: `Selecione ao menos ${MIN_PLACES} locais para compor a pauta.`,
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
      const response = await createStoryAction({
        slug: generatedSlug,
        title: title.trim(),
        subtitle: subtitle.trim() || title.trim(),
        neighborhood: neighborhood.trim() || null,
        introText: introText.trim(),
        closingText: closingText.trim() || null,
        publishImmediately,
        places: placesContent.map((place) => ({
          placeId: place.placeId,
          angleTitle: place.angleTitle.trim() || `Destaque: ${place.placeName}`,
          bodyText:
            place.bodyText.trim().length >= 20
              ? place.bodyText.trim()
              : `Espaço especial da comunidade: ${place.placeName}. Local imperdível para conhecer.`,
          localTip: place.localTip.trim() || null,
        })),
      });

      if (!response.success) {
        responseToast.error({
          title: "Erro ao salvar pauta",
          description: response.message,
        });
        return;
      }

      responseToast.success({
        title: publishImmediately ? "Pauta publicada!" : "Rascunho salvo!",
        description: response.message,
      });

      if (response.storySlug) {
        router.push(`/pautas/${response.storySlug}`);
      } else {
        router.push("/community");
      }
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
    responseToast.success({ title: "Conteúdo copiado para a área de transferência" });
  }

  // Estatísticas e capa para o preview
  const previewCoverPhoto = useMemo(() => {
    const firstWithPhoto = selectedPlaces.find((p) => Boolean(p.fotoUrl));
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
      ...placesContent.map((p) => `${p.angleTitle} ${p.bodyText} ${p.localTip}`),
      closingText,
    ]
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;

    return Math.max(2, Math.ceil(totalWords / 160));
  }, [title, subtitle, introText, placesContent, closingText]);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] w-full overflow-hidden bg-background">
      {/* topbar - actions */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-6 bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/community">
              <ArrowLeftIcon className="size-4 mr-1.5" />
              Voltar à Comunidade
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Criador de Pauta</span>
            <Badge variant="outline" className="text-xs">
              Preview em Tempo Real
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
              <Loader2Icon className="size-4 animate-spin mr-1.5" />
            )}
            Salvar Rascunho
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleSaveStory(true)}
            disabled={
              isPublishing ||
              isSavingDraft ||
              !title.trim() ||
              selectedPlaces.length < MIN_PLACES
            }
          >
            {isPublishing ? (
              <Loader2Icon className="size-4 animate-spin mr-1.5" />
            ) : (
              <SendIcon className="size-4 mr-1.5" />
            )}
            Publicar Pauta
          </Button>
        </div>
      </header>

      {/* split screen workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* left column: editor */}
        <div className="flex-1 overflow-y-auto border-r p-6 space-y-6 lg:max-w-[55%]">
          {/* section 1: ai suggestion & places selection */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-5 space-y-4">
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
                        Descreva o recorte. A IA usará os fatos reais do mapa
                        para rascunhar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* selected places */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>
                      Locais Escolhidos ({selectedPlaces.length} de {MAX_PLACES})
                    </FormLabel>
                    <span className="text-muted-foreground text-xs">
                      Mínimo de {MIN_PLACES}
                    </span>
                  </div>

                  {selectedPlaces.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      Selecione ao menos 2 locais na grade abaixo.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedPlaces.map((place) => (
                        <div
                          key={place.id}
                          className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-2 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {place.fotoUrl ? (
                              <Image
                                src={place.fotoUrl}
                                alt={place.nome}
                                width={36}
                                height={36}
                                className="size-9 rounded-md object-cover flex-none"
                              />
                            ) : (
                              <div className="flex size-9 flex-none items-center justify-center rounded-md bg-muted text-muted-foreground">
                                <MapPinIcon className="size-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium truncate text-foreground">
                                {place.nome}
                              </p>
                              <p className="text-muted-foreground text-[11px] truncate">
                                {place.categoria} · {place.bairro}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePlace(place.id)}
                            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-destructive transition-colors ml-2 flex-none"
                            title="Remover local"
                          >
                            <XIcon className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* search input */}
                <div className="space-y-2">
                  <FormLabel>Buscar Locais no Catálogo</FormLabel>
                  <div className="relative">
                    <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Busque por nome, bairro ou categoria (tolerante a acentos e erros)..."
                      className="pl-9 pr-9"
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

                {/* places grid selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {searchQuery
                        ? "Resultados correspondentes:"
                        : "Locais sugeridos:"}
                    </span>
                    <span>{searchResults.length} disponíveis</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {searchResults.map((place) => {
                      const isSelected = selectedIds.includes(place.id);
                      return (
                        <div
                          key={place.id}
                          className={cn(
                            "flex items-center justify-between rounded-xl border p-2.5 transition-all text-xs",
                            isSelected
                              ? "border-primary bg-primary/10 shadow-xs"
                              : "border-border bg-card hover:border-primary/40 hover:bg-muted/30",
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {place.fotoUrl ? (
                              <Image
                                src={place.fotoUrl}
                                alt={place.nome}
                                width={44}
                                height={44}
                                className="size-11 rounded-lg object-cover flex-none"
                              />
                            ) : (
                              <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <MapPinIcon className="size-5" />
                              </div>
                            )}

                            <div className="min-w-0 space-y-0.5">
                              <p className="font-medium text-foreground truncate">
                                {place.nome}
                              </p>
                              <p className="text-muted-foreground text-[11px] truncate">
                                {place.categoria} · {place.bairro}
                              </p>
                              <div className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                                <StarIcon className="size-3 fill-amber-500" />
                                <span>{place.nota.toFixed(1)}</span>
                                <span className="text-muted-foreground text-[10px]">
                                  ({place.avaliacoes})
                                </span>
                              </div>
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant={isSelected ? "secondary" : "outline"}
                            className="ml-2 h-8 px-2.5 flex-none"
                            disabled={!isSelected && selectedIds.length >= MAX_PLACES}
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
                  <div className="text-xs text-muted-foreground">
                    Clique para gerar com Gemini ou escreva o texto abaixo.
                  </div>

                  <Button
                    type="submit"
                    disabled={isGenerating || selectedIds.length < MIN_PLACES}
                  >
                    {isGenerating ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <SparklesIcon className="size-4" />
                    )}
                    {title ? "Regerar com IA" : "Gerar com IA"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* section 2: editorial content form */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base">
                  2. Conteúdo da Matéria
                </h3>
                <p className="text-xs text-muted-foreground">
                  Modifique os textos diretamente. O preview à direita refletirá
                  as alterações instantaneamente.
                </p>
              </div>

              {modelo && (
                <Badge variant="outline" className="text-xs gap-1">
                  <SparklesIcon className="size-3" />
                  Rascunho por {modelo}
                </Badge>
              )}
            </div>

            {modelo && (
              <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-warning text-xs">
                <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
                <span>
                  Texto sugerido por modelo de inteligência artificial. Verifique
                  afirmações e fatos antes de publicar.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Título da Pauta *</label>
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
                <label className="text-xs font-medium">Slug URL</label>
                <Input
                  value={slug}
                  onChange={(event) => setSlug(slugify(event.target.value))}
                  placeholder="ex.: 4-cafes-tranquilos-wifi"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">
                  Subtítulo / Chamada *
                </label>
                <Input
                  value={subtitle}
                  onChange={(event) => setSubtitle(event.target.value)}
                  placeholder="Resumo que aparece no feed da comunidade"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">
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
              <label className="text-xs font-medium">
                Introdução da Pauta *
              </label>
              <Textarea
                rows={3}
                value={introText}
                onChange={(event) => setIntroText(event.target.value)}
                placeholder="Apresente o roteiro e o recorte editorial escolhido..."
              />
            </div>

            {/* places specific cards editing */}
            {placesContent.length > 0 && (
              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Destaques dos Locais da Pauta
                </label>

                {placesContent.map((place, index) => (
                  <div
                    key={place.placeId}
                    className="rounded-lg border border-border/80 bg-muted/20 p-3.5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">
                        #{index + 1} {place.placeName}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemovePlace(place.placeId)}
                      >
                        <Trash2Icon className="size-3.5 mr-1" />
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
              <label className="text-xs font-medium">
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

        {/* right column: live preview */}
        <div className="hidden lg:flex flex-1 flex-col overflow-y-auto bg-muted/10 p-8">
          <div className="mx-auto w-full max-w-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <EyeIcon className="size-4 text-primary" />
                Pré-visualização Fiel da Página
              </div>
              <Badge variant="outline" className="text-[11px]">
                /pautas/{slug || "slug-da-pauta"}
              </Badge>
            </div>

            {/* preview content card */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              {/* cover banner */}
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
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs">
                    {neighborhood || "Sorocaba"}
                  </Badge>
                </div>
              </div>

              {/* article body */}
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
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
                      <ClockIcon className="size-3 mr-1" />
                      {readingTimeMinutes} min de leitura
                    </Badge>

                    <Badge variant="ghost">Hoje</Badge>
                  </div>
                </div>

                <p className="text-base text-muted-foreground leading-relaxed italic">
                  {subtitle ||
                    "O subtítulo ou chamada da pauta aparecerá aqui sintetizando o roteiro..."}
                </p>

                <Separator />

                {/* intro */}
                <div className="space-y-4 text-sm leading-relaxed text-foreground">
                  <p className="text-pretty">
                    {introText ||
                      "A introdução do roteiro aparecerá aqui apresentando a proposta da cidade..."}
                  </p>

                  {/* places stops */}
                  {placesContent.map((place, index) => (
                    <div
                      key={place.placeId}
                      className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2 mt-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-foreground">
                          {index + 1}. {place.placeName}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {place.categoryName} · {place.neighborhood}
                        </Badge>
                      </div>

                      {place.angleTitle && (
                        <p className="font-medium text-xs text-primary">
                          {place.angleTitle}
                        </p>
                      )}

                      <p className="text-xs text-pretty leading-relaxed text-muted-foreground">
                        {place.bodyText || "Detalhes e impressões sobre o local..."}
                      </p>

                      {place.localTip && (
                        <div className="flex items-start gap-1.5 rounded-md bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400 text-xs">
                          <span className="font-medium flex-none">💡 Dica local:</span>
                          <span>{place.localTip}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* closing */}
                  {closingText && (
                    <p className="text-pretty text-muted-foreground pt-2">
                      {closingText}
                    </p>
                  )}
                </div>

                {/* places cards summary */}
                {selectedPlaces.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-semibold text-sm">
                      Lugares desta pauta ({selectedPlaces.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedPlaces.map((place) => (
                        <Card
                          key={place.id}
                          size="sm"
                          className="border border-border bg-card/60"
                        >
                          <CardContent className="flex items-center justify-between gap-3 p-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {place.fotoUrl ? (
                                <Image
                                  src={place.fotoUrl}
                                  alt={place.nome}
                                  width={36}
                                  height={36}
                                  className="size-9 rounded-md object-cover flex-none"
                                />
                              ) : (
                                <div className="flex size-9 flex-none items-center justify-center rounded-md bg-muted text-muted-foreground">
                                  <MapPinIcon className="size-4" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-xs truncate">
                                  {place.nome}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {place.categoria} · {place.bairro}
                                </p>
                              </div>
                            </div>

                            <ExternalLinkIcon className="size-3.5 text-muted-foreground flex-none" />
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
  );
}
