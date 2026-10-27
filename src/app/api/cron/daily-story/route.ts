import { updateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { FEED_LIST_TAG, STORIES_LIST_TAG } from "@/constants/reports";
import type { PlaceSummaryDto } from "@/http/api.schemas";
import { listPlaces } from "@/http/places/places";
import { http, type HttpResponse } from "@/lib/client";
import { type GeminiSchema, generateJson } from "@/lib/gemini";
import { slugify } from "@/utils/formatters/slugify";
import { storyDraftSchema } from "@/validations/stories";

const SYSTEM_INSTRUCTION = `Você é editor de um guia local da cidade de Sorocaba (SP), escrevendo em português do Brasil.

REGRAS INEGOCIÁVEIS:
- Use SOMENTE os fatos listados no prompt. É proibido inventar preço, horário de funcionamento, endereço, telefone, nome de prato, nome de pessoa, prêmio, história do estabelecimento ou qualquer dado que não esteja na lista.
- Se um fato não estiver na lista, não mencione o assunto. Silêncio é melhor que suposição.
- Não prometa nada em nome do estabelecimento e não use superlativo publicitário ("imperdível", "incrível", "o melhor da cidade") a menos que seja citação de uma avaliação fornecida.
- Não invente número: se a lista traz "4,8 de nota com 21 avaliações", use exatamente isso.

ESTILO:
- Tom direto e útil, de quem já foi ao lugar. Frase curta.
- Cada parágrafo entre 300 e 600 caracteres, sem título interno nem marcador.
- O primeiro parágrafo apresenta o recorte do roteiro; os seguintes tratam dos lugares, na ordem dada.
- O chapéu é uma palavra ou duas (ex.: "Roteiro", "Comparativo", "Spotlight").`;

const DRAFT_SCHEMA: GeminiSchema = {
  type: "object",
  properties: {
    chapeu: { type: "string" },
    titulo: { type: "string" },
    chamada: { type: "string" },
    corpo: { type: "array", items: { type: "string" } },
  },
  required: ["chapeu", "titulo", "chamada", "corpo"],
};

/**
 * Validates request authorization against the configured secret key.
 */
function isValidCronRequest(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET ?? "soromaps-cron-secret-2026";
  const authHeader = request.headers.get("authorization");
  const cronKeyHeader = request.headers.get("x-cron-key");

  if (cronKeyHeader && cronKeyHeader === cronSecret) return true;

  if (authHeader) {
    const bearerToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (bearerToken === cronSecret) return true;
  }

  return false;
}

/**
 * Selects candidate places maximizing diversity of neighborhoods and categories.
 */
function selectDiversePlaces(
  candidatePlaces: PlaceSummaryDto[],
  targetCount = 3,
): PlaceSummaryDto[] {
  const selectedPlaces: PlaceSummaryDto[] = [];
  const usedNeighborhoods = new Set<string>();
  const usedCategories = new Set<string>();

  for (const place of candidatePlaces) {
    if (selectedPlaces.length >= targetCount) break;

    const neighborhoodKey = place.neighborhood?.toLowerCase().trim() ?? "";
    const categoryKey = place.category?.name?.toLowerCase().trim() ?? "";

    if (!usedNeighborhoods.has(neighborhoodKey) && !usedCategories.has(categoryKey)) {
      selectedPlaces.push(place);
      if (neighborhoodKey) usedNeighborhoods.add(neighborhoodKey);
      if (categoryKey) usedCategories.add(categoryKey);
    }
  }

  if (selectedPlaces.length < targetCount)
    for (const place of candidatePlaces) {
      if (selectedPlaces.length >= targetCount) break;
      if (!selectedPlaces.some((item) => item.id === place.id))
        selectedPlaces.push(place);
    }

  return selectedPlaces;
}

/**
 * Formats factual attributes of a place for LLM prompt ingestion.
 */
function formatPlaceFacts(place: PlaceSummaryDto): string {
  const lines = [
    `- Nome: ${place.name}`,
    `- Bairro: ${place.neighborhood || "Sorocaba"}`,
    `- Categoria: ${place.category?.name || "Geral"}`,
    `- Características: ${place.tags?.map((tag) => tag.name).join(", ") || "Nenhuma informada"}`,
    `- Wi-fi: ${place.hasWifi ? "tem" : "não tem"}`,
    `- Aceita pet: ${place.isPetFriendly ? "sim" : "não"}`,
    `- Nota: ${Number(place.ratingAverage || 0).toFixed(1)} em ${place.reviewsCount ?? 0} avaliações`,
    `- Resumo: ${place.about || ""}`,
  ];

  return lines.join("\n");
}

/**
 * Handles the daily AI-powered story generation and persistence workflow.
 */
async function handleDailyStorySync(request: NextRequest): Promise<NextResponse> {
  if (!isValidCronRequest(request))
    return NextResponse.json(
      { success: false, message: "Não autorizado para acionamento de rotinas de cron." },
      { status: 401 },
    );

  const placesResponse = await listPlaces({ PageSize: 25 });

  if (placesResponse.status !== 200 || !placesResponse.data?.items)
    return NextResponse.json(
      { success: false, message: "Não foi possível carregar o catálogo de locais." },
      { status: 502 },
    );

  const candidatePlaces = placesResponse.data.items.filter(
    (place) => place.status === 2 || place.status === undefined,
  );

  if (candidatePlaces.length < 2)
    return NextResponse.json({
      success: false,
      message: "Quantidade insuficiente de locais aprovados para compor pauta diária.",
    });

  const selectedPlaces = selectDiversePlaces(candidatePlaces, 3);
  const factsText = selectedPlaces.map(formatPlaceFacts).join("\n\n");

  const prompt = `Tema pedido pela redação: Destaques e vivências autênticas em Sorocaba para hoje

Escreva a pauta usando apenas os lugares abaixo, nesta ordem. O primeiro parágrafo introduz o recorte do roteiro para quem quer explorar a cidade. Os parágrafos seguintes devem retratar fielmente cada um dos locais enumerados.

${factsText}`;

  const geminiResponse = await generateJson({
    system: SYSTEM_INSTRUCTION,
    schema: DRAFT_SCHEMA,
    prompt,
  });

  if (!geminiResponse.ok)
    return NextResponse.json(
      {
        success: false,
        message:
          geminiResponse.reason === "sem-chave"
            ? "Chave de inteligência artificial não configurada."
            : (geminiResponse.detail ?? "Falha na geração editorial com IA."),
      },
      { status: 500 },
    );

  const draftValidation = storyDraftSchema.safeParse(geminiResponse.data);

  if (!draftValidation.success)
    return NextResponse.json(
      {
        success: false,
        message: "Estrutura do rascunho retornado pela IA é inválida.",
        errors: draftValidation.error.flatten().fieldErrors,
      },
      { status: 422 },
    );

  const draft = draftValidation.data;
  const todayDate = new Date().toISOString().slice(0, 10);
  const baseSlug = slugify(draft.titulo) || "pauta-diaria";
  const storySlug = `${baseSlug}-${todayDate}`;

  const introText = draft.corpo[0] ?? "";
  const closingText =
    draft.corpo.length > selectedPlaces.length + 1
      ? draft.corpo[draft.corpo.length - 1]
      : null;

  const placesPayload = selectedPlaces.map((place, index) => {
    const paragraphIndex = index + 1;
    const paragraph =
      draft.corpo[paragraphIndex] ??
      draft.corpo[1] ??
      place.about ??
      `Conheça ${place.name} em ${place.neighborhood}.`;

    return {
      placeId: place.id,
      sortOrder: index + 1,
      angleTitle: `Destaque: ${place.name}`,
      bodyText: paragraph,
      localTip: null,
    };
  });

  const cronSecret = process.env.CRON_SECRET ?? "soromaps-cron-secret-2026";
  const apiResponse = await http<HttpResponse<{ id?: string; slug?: string }>>(
    "/api/stories/cron-sync",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Cron-Key": cronSecret,
      },
      body: JSON.stringify({
        slug: storySlug,
        title: draft.titulo,
        subtitle: draft.chamada,
        neighborhood: selectedPlaces[0]?.neighborhood ?? null,
        introText,
        closingText,
        origin: 1,
        places: placesPayload,
      }),
    },
  );

  if (apiResponse.status !== 201)
    return NextResponse.json(
      {
        success: false,
        message: "Falha ao persistir pauta diária na API.",
        details: apiResponse.data,
      },
      {
        status:
          apiResponse.status >= 400 && apiResponse.status < 600
            ? apiResponse.status
            : 500,
      },
    );

  updateTag(STORIES_LIST_TAG);
  updateTag(FEED_LIST_TAG);

  return NextResponse.json({
    success: true,
    message: "Rascunho de pauta diária sincronizado com sucesso via IA.",
    slug: storySlug,
    story: apiResponse.data,
  });
}

/**
 * Triggers the automated daily editorial story synchronization via GET request.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return handleDailyStorySync(request);
}

/**
 * Triggers the automated daily editorial story synchronization via POST request.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return handleDailyStorySync(request);
}
