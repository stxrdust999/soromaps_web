"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckIcon,
  CopyIcon,
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
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  createStoryAction,
  generateStoryDraftAction,
  type PlaceStoryItem,
  searchPlacesForStoryAction,
} from "@/actions/stories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  angleTitle: string;
  bodyText: string;
  localTip: string;
}

/**
 * Modal expandido de geração, edição e publicação de pautas editoriais na comunidade.
 */
export function StoryGeneratorDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [modelo, setModelo] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceStoryItem[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<PlaceStoryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Campos do formulário editorial completo
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
    if (!open) return;
    const timer = setTimeout(() => {
      loadPlaces(searchQuery);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, open, loadPlaces]);

  function handleAddPlace(place: PlaceStoryItem) {
    if (selectedIds.includes(place.id) || selectedIds.length >= MAX_PLACES)
      return;

    const nextIds = [...selectedIds, place.id];
    form.setValue("localIds", nextIds, { shouldValidate: true });
    setSelectedPlaces((current) => [...current, place]);

    // Atualiza bairro automaticamente se ainda não preenchido
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

    // Mapeia parágrafos intermediários para cada local selecionado
    const nextPlacesContent: StoryPlaceDraftInput[] = selectedPlaces.map(
      (place, index) => {
        const paragraph =
          draft.corpo[index + 1] || draft.corpo[1] || place.sobre || "";
        return {
          placeId: place.id,
          placeName: place.nome,
          angleTitle: `Por que ir no ${place.nome}`,
          bodyText: paragraph,
          localTip: "",
        };
      },
    );

    setPlacesContent(nextPlacesContent);
    responseToast.success({
      title: "Rascunho gerado com sucesso!",
      description: "Edite o texto abaixo e publique quando estiver pronto.",
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

      handleReset();
      setOpen(false);

      if (response.storySlug) {
        router.push(`/pautas/${response.storySlug}`);
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

  function handleReset() {
    setTitle("");
    setSlug("");
    setSubtitle("");
    setNeighborhood("");
    setIntroText("");
    setClosingText("");
    setPlacesContent([]);
    setModelo(null);
    setSelectedPlaces([]);
    setSearchQuery("");
    form.reset();
  }

  const hasDraftOrContent =
    Boolean(title.trim()) ||
    Boolean(introText.trim()) ||
    placesContent.length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) handleReset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <SparklesIcon />
          Gerar pauta
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-4xl p-0">
        {/* modal - header */}
        <div className="border-b px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Criar e Publicar Pauta Editorial
            </DialogTitle>
            <DialogDescription>
              Crie uma pauta com os dados dos locais de Sorocaba. Use a IA para
              gerar o rascunho de ideias e edite o texto final livremente antes
              de publicar.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* modal - scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* section: generator inputs */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">
                1. Configuração do Roteiro & Sugestão por IA
              </span>
              <Badge variant="outline" className="text-xs">
                {selectedIds.length} de {MAX_PLACES} locais escolhidos
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
                          placeholder="Ex.: cafés aconchegantes para trabalhar no centro"
                        />
                      </FormControl>
                      <FormDescription>
                        Descreva o foco da pauta em uma linha. A IA buscará os
                        fatos reais do mapa.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* selected places summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>
                      Locais Selecionados ({selectedPlaces.length} de{" "}
                      {MAX_PLACES})
                    </FormLabel>
                    {selectedPlaces.length > 0 && (
                      <span className="text-muted-foreground text-xs">
                        Mínimo de {MIN_PLACES} locais
                      </span>
                    )}
                  </div>

                  {selectedPlaces.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      Nenhum local selecionado. Escolha na grade abaixo.
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

                {/* places search input */}
                <div className="space-y-2">
                  <FormLabel>Buscar Locais no Banco</FormLabel>
                  <div className="relative">
                    <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Busque por nome, bairro ou tipo (com tolerância a erros e acentos)..."
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
                        : "Sugestões de locais recomendados:"}
                    </span>
                    <span>{searchResults.length} disponíveis</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
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
                    Clique abaixo para redigir um rascunho com o Gemini ou edite
                    manualmente.
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
                    {hasDraftOrContent ? "Regerar com IA" : "Gerar com IA"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* section: editable post content */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base">
                  2. Conteúdo da Pauta Editorial
                </h3>
                <p className="text-xs text-muted-foreground">
                  Você pode editar livremente qualquer texto abaixo antes de
                  publicar ou salvar.
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
                  Revise cuidadosamente endereços, dados e afirmações antes de
                  publicar para os exploradores.
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

        {/* modal - footer actions */}
        <div className="flex items-center justify-between border-t bg-muted/10 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyContent}
            disabled={!hasDraftOrContent}
          >
            <CopyIcon className="size-4" />
            Copiar texto
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}