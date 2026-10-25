"use server";

import { updateTag } from "next/cache";

import { FEED_LIST_TAG, STORIES_LIST_TAG, storyShowTag } from "@/constants/reports";
import { getApiErrorMessage } from "@/helpers/api-error";
import type { ProblemDetails } from "@/http/api.schemas";
import { getPlaceById, listPlaces } from "@/http/places/places";
import { createStory, publishStory, updateStory } from "@/http/stories/stories";
import { http, type HttpResponse } from "@/lib/client";
import {
  type GeminiSchema,
  geminiModelDisplayName,
  generateJson,
} from "@/lib/gemini";
import type { FormState } from "@/types/form";
import {
  generateStorySchema,
  publishStorySchema,
  type PublishStorySchema,
  type StoryDraftSchema,
  storyDraftSchema,
  updateStorySchema,
  type UpdateStorySchema,
} from "@/validations/stories";

/**
 * Remove acentuação e converte string para caixa baixa facilitando comparações flexíveis.
 */
function cleanAccents(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Distância de Levenshtein para medir erros de digitação e pequenas divergências de grafia.
 */
function calculateLevenshteinDistance(source: string, target: string): number {
  if (source === target) return 0;
  if (source.length === 0) return target.length;
  if (target.length === 0) return source.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= source.length; i++) matrix[i] = [i];
  for (let j = 0; j <= target.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= source.length; i++) {
    for (let j = 1; j <= target.length; j++) {
      const cost = source[i - 1] === target[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[source.length][target.length];
}

/**
 * Avalia se um texto corresponde a uma consulta com tolerância a acentos e pequenas discrepâncias.
 */
function isFuzzyMatch(candidateText: string, searchTerm: string): boolean {
  const cleanCandidate = cleanAccents(candidateText);
  const cleanQuery = cleanAccents(searchTerm);

  if (cleanCandidate.includes(cleanQuery)) return true;

  const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);
  const allTokensMatched = queryTokens.every((token) =>
    cleanCandidate.includes(token),
  );
  if (allTokensMatched) return true;

  const candidateWords = cleanCandidate.split(/[\s,.-]+/).filter(Boolean);
  for (const token of queryTokens) {
    if (token.length >= 3) {
      for (const word of candidateWords) {
        if (Math.abs(word.length - token.length) <= 2) {
          const distance = calculateLevenshteinDistance(word, token);
          if (distance <= 1) return true;
        }
      }
    }
  }

  return false;
}

/**
 * Geração de pauta.
 *
 * **A geração é etapa de autoria, não de render.** Nada aqui roda durante a
 * navegação do leitor: alguém pede o rascunho, o modelo escreve, e um humano
 * decide se aquilo vira pauta publicada. O motivo é direto — texto sobre
 * comércio de verdade que inventa preço, horário ou qualidade vira prejuízo
 * para um negócio real, e um guia local vive de não fazer isso.
 *
 * Três defesas, nesta ordem:
 * 1. **Os lugares vêm da tela, não do modelo.** Ele recebe uma lista fechada e
 *    os fatos de cada um; não escolhe sobre o que falar.
 * 2. **A instrução de sistema proíbe fato fora da lista**, com os campos
 *    permitidos enumerados.
 * 3. **A saída é revalidada com Zod.** `responseSchema` da API não garante
 *    conteúdo — saída de modelo é entrada não confiável como qualquer outra.
 *
 * O rascunho **não é persistido**: não existe tabela de pauta. A action
 * devolve o texto para a tela mostrar e o revisor copiar. Quando a entidade
 * nascer, é aqui que entram o `insert` com `status: "rascunho"` e o
 * `updateTag`.
 */

const INVALID_PAYLOAD_MESSAGE =
  "Confira o tema e os lugares escolhidos antes de gerar.";
const MISSING_KEY_MESSAGE =
  "O serviço de geração inteligente está temporariamente indisponível. Tente novamente mais tarde.";
const REQUEST_FAILED_MESSAGE =
  "O modelo não respondeu. Tente de novo em alguns instantes.";
const MALFORMED_MESSAGE =
  "O modelo devolveu um texto fora do formato esperado. Gere de novo.";

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
 * Ficha de fatos de um lugar, do jeito que o modelo recebe.
 *
 * Só entra o que o produto realmente sabe. Hoje isso vem de
 * `src/mocks/markers.ts`; quando o modelo do ponto crescer, vem da API — e
 * este é o único ponto que muda.
 *
 * @param id Id do lugar no catálogo.
 * @returns Bloco de texto com os fatos, ou `null` se o id não existe.
 */
async function placeFacts(id: string): Promise<string | null> {
  try {
    const response = await getPlaceById(id);
    if (response.status === 200) {
      const place = response.data;
      const lines = [
        `- Nome: ${place.name}`,
        `- Bairro: ${place.neighborhood ?? "Sorocaba"}`,
        `- Categoria: ${place.category.name}`,
        `- Características: ${place.tags.map((tag) => tag.name).join(", ")}`,
        `- Wi-fi: ${place.hasWifi ? "tem" : "não tem"}`,
        `- Aceita pet: ${place.isPetFriendly ? "sim" : "não"}`,
        `- Nota: ${Number(place.ratingAverage).toFixed(1)} em ${place.reviewsCount} avaliações`,
        `- Resumo: ${place.about ?? ""}`,
        `- Descrição: ${place.description || place.about || ""}`,
      ];
      return lines.join("\n");
    }
  } catch (error) {
    console.error("placeFacts error:", error);
  }

  return null;
}

export interface PlaceStoryItem {
  id: string;
  nome: string;
  bairro: string;
  categoria: string;
  nota: number;
  avaliacoes: number;
  fotoUrl: string | null;
  sobre: string;
}

/**
 * Busca ou sugere locais aprovados para compor uma pauta editorial.
 * Oferece sugestões aleatórias/populares quando a busca estiver vazia
 * e filtragem com tolerância fonética e a acentos conforme o usuário digita.
 */
export async function searchPlacesForStoryAction(
  query: string,
): Promise<PlaceStoryItem[]> {
  const trimmedQuery = query.trim();

  try {
    const response = await listPlaces({
      Search: trimmedQuery.length > 0 ? trimmedQuery : undefined,
      PageSize: 20,
    });

    if (response.status !== 200 || !response.data.items) {
      return [];
    }

    const items = response.data.items;

    if (!trimmedQuery) {
      return items.slice(0, 6).map((item) => ({
        id: item.id,
        nome: item.name,
        bairro: item.neighborhood ?? "Sorocaba",
        categoria: item.category.name,
        nota: Number(item.ratingAverage) || 0,
        avaliacoes: Number(item.reviewsCount) || 0,
        fotoUrl: item.coverPhotoUrl ?? null,
        sobre: item.about ?? "",
      }));
    }

    const filtered = items.filter((item) => {
      const matchName = isFuzzyMatch(item.name, trimmedQuery);
      const matchAbout = isFuzzyMatch(item.about ?? "", trimmedQuery);
      const matchNeighborhood = isFuzzyMatch(
        item.neighborhood ?? "",
        trimmedQuery,
      );
      const matchCategory = isFuzzyMatch(item.category.name, trimmedQuery);
      return matchName || matchAbout || matchNeighborhood || matchCategory;
    });

    const results = filtered.length > 0 ? filtered : items;

    return results.slice(0, 8).map((item) => ({
      id: item.id,
      nome: item.name,
      bairro: item.neighborhood ?? "Sorocaba",
      categoria: item.category.name,
      nota: Number(item.ratingAverage) || 0,
      avaliacoes: Number(item.reviewsCount) || 0,
      fotoUrl: item.coverPhotoUrl ?? null,
      sobre: item.about ?? "",
    }));
  } catch (error) {
    console.error("searchPlacesForStoryAction error:", error);
    return [];
  }
}

export interface StoryDraftState extends FormState {
  draft?: StoryDraftSchema;
  /** Modelo que redigiu — vai junto no rótulo da pauta. */
  modelo?: string;
}

/**
 * Gera o rascunho de uma pauta a partir de um tema e de lugares do mapa.
 *
 * @param data Form data com `tema` e um `localIds` por lugar marcado.
 * @returns Estado com o rascunho, ou a mensagem do que impediu.
 */
export async function generateStoryDraftAction(
  data: FormData,
): Promise<StoryDraftState> {
  const result = generateStorySchema.safeParse({
    tema: data.get("tema"),
    localIds: data.getAll("localIds").map(String),
  });

  if (!result.success) {
    return {
      success: false,
      message: INVALID_PAYLOAD_MESSAGE,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const factPromises = result.data.localIds.map(placeFacts);
  const factsResolved = await Promise.all(factPromises);
  const facts = factsResolved.filter((block): block is string => block !== null);

  if (facts.length < result.data.localIds.length) {
    return { success: false, message: INVALID_PAYLOAD_MESSAGE, errors: null };
  }

  const response = await generateJson({
    system: SYSTEM_INSTRUCTION,
    schema: DRAFT_SCHEMA,
    prompt: `Tema pedido pela redação: ${result.data.tema}

Escreva a pauta usando apenas os lugares abaixo, nesta ordem.

${facts.join("\n\n")}`,
  });

  if (!response.ok) {
    return {
      success: false,
      message:
        response.reason === "sem-chave"
          ? MISSING_KEY_MESSAGE
          : (response.detail ?? REQUEST_FAILED_MESSAGE),
      errors: null,
    };
  }

  const draft = storyDraftSchema.safeParse(response.data);

  if (!draft.success) {
    return { success: false, message: MALFORMED_MESSAGE, errors: null };
  }

  return {
    success: true,
    message: "Rascunho gerado. Revise antes de publicar.",
    errors: null,
    draft: draft.data,
    modelo: geminiModelDisplayName(),
  };
}

/**
 * Cria e opcionalmente publica uma pauta editorial com locais associados.
 */
export async function createStoryAction(
  rawInput: PublishStorySchema,
): Promise<FormState & { storySlug?: string }> {
  const result = publishStorySchema.safeParse(rawInput);

  if (!result.success) {
    return {
      success: false,
      message: "Verifique os campos da pauta antes de prosseguir.",
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { publishImmediately, ...storyData } = result.data;

  try {
    const createResponse = await createStory({
      slug: storyData.slug,
      title: storyData.title,
      subtitle: storyData.subtitle,
      neighborhood: storyData.neighborhood ?? null,
      introText: storyData.introText,
      closingText: storyData.closingText ?? null,
      origin: 0,
      places: storyData.places.map((place, index) => ({
        placeId: place.placeId,
        sortOrder: index + 1,
        angleTitle: place.angleTitle,
        bodyText: place.bodyText,
        localTip: place.localTip ?? null,
      })),
    });

    if (createResponse.status !== 201) {
      return {
        success: false,
        message: getApiErrorMessage(
          createResponse.data,
          "Não foi possível salvar a pauta.",
        ),
        errors: null,
      };
    }

    const createdStory = createResponse.data;

    if (publishImmediately) {
      const publishResponse = await publishStory(createdStory.id);
      if (publishResponse.status !== 200) {
        updateTag(STORIES_LIST_TAG);
        return {
          success: true,
          message:
            "Pauta salva como rascunho. Porém, ocorreu um erro ao publicá-la automaticamente.",
          errors: null,
          storySlug: createdStory.slug,
        };
      }
    }

    updateTag(STORIES_LIST_TAG);
    updateTag(FEED_LIST_TAG);

    return {
      success: true,
      message: publishImmediately
        ? "Pauta publicada com sucesso para a comunidade!"
        : "Rascunho da pauta salvo com sucesso!",
      errors: null,
      storySlug: createdStory.slug,
    };
  } catch (error) {
    console.error("createStoryAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Publica uma pauta existente em rascunho e atualiza o cache da comunidade e feed.
 */
export async function publishStoryAction(
  id: string,
  slug: string,
): Promise<FormState> {
  try {
    const response = await publishStory(id);

    if (response.status !== 200) {
      return {
        success: false,
        message: getApiErrorMessage(
          response.data,
          "Não foi possível publicar a pauta.",
        ),
        errors: null,
      };
    }

    updateTag(storyShowTag(slug));
    updateTag(STORIES_LIST_TAG);
    updateTag(FEED_LIST_TAG);

    return {
      success: true,
      message: "Pauta publicada com sucesso para toda a comunidade!",
      errors: null,
    };
  } catch (error) {
    console.error("publishStoryAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Atualiza os dados de conteúdo e paradas de uma pauta editorial existente com suporte a publicação imediata.
 *
 * @param rawInput Dados validados contendo identificador da pauta, conteúdo textual e locais associados.
 * @returns Estado da operação com o slug resultante para redirecionamento.
 */
export async function updateStoryAction(
  rawInput: UpdateStorySchema,
): Promise<FormState & { storySlug?: string }> {
  const result = updateStorySchema.safeParse(rawInput);

  if (!result.success) {
    return {
      success: false,
      message: "Verifique os campos da pauta antes de prosseguir.",
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { id, publishImmediately, ...storyData } = result.data;

  try {
    const updateResponse = await updateStory(id, {
      slug: storyData.slug,
      title: storyData.title,
      subtitle: storyData.subtitle,
      neighborhood: storyData.neighborhood ?? null,
      introText: storyData.introText,
      closingText: storyData.closingText ?? null,
      places: storyData.places.map((place, index) => ({
        placeId: place.placeId,
        sortOrder: index + 1,
        angleTitle: place.angleTitle,
        bodyText: place.bodyText,
        localTip: place.localTip ?? null,
      })),
    });

    if (updateResponse.status !== 200) {
      return {
        success: false,
        message: getApiErrorMessage(
          updateResponse.data,
          "Não foi possível atualizar a pauta editorial.",
        ),
        errors: null,
      };
    }

    const updatedStory = updateResponse.data;

    if (publishImmediately) {
      const publishResponse = await publishStory(updatedStory.id);
      if (publishResponse.status !== 200) {
        updateTag(storyShowTag(updatedStory.slug));
        updateTag(STORIES_LIST_TAG);
        return {
          success: true,
          message:
            "Pauta atualizada como rascunho. Porém, ocorreu um erro ao publicá-la automaticamente.",
          errors: null,
          storySlug: updatedStory.slug,
        };
      }
    }

    updateTag(storyShowTag(updatedStory.slug));
    updateTag(STORIES_LIST_TAG);
    updateTag(FEED_LIST_TAG);

    return {
      success: true,
      message: publishImmediately
        ? "Pauta atualizada e publicada com sucesso para a comunidade!"
        : "Rascunho da pauta atualizado com sucesso!",
      errors: null,
      storySlug: updatedStory.slug,
    };
  } catch (error) {
    console.error("updateStoryAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}

/**
 * Exclui um rascunho de pauta editorial existente e invalida os caches relacionados.
 *
 * @param id Identificador único UUID da pauta a ser excluída.
 * @param slug Slug amigável da pauta para invalidação pontual do cache de detalhes.
 * @returns Estado da operação com mensagem para feedback ao usuário.
 */
export async function deleteStoryAction(
  id: string,
  slug?: string,
): Promise<FormState> {
  try {
    const response = await http<HttpResponse<ProblemDetails | undefined>>(
      `/api/stories/${id}`,
      {
        method: "DELETE",
      },
    );

    if (response.status !== 204) {
      return {
        success: false,
        message: getApiErrorMessage(
          response.data,
          "Não foi possível excluir o rascunho da pauta.",
        ),
        errors: null,
      };
    }

    if (slug) updateTag(storyShowTag(slug));
    updateTag(STORIES_LIST_TAG);
    updateTag(FEED_LIST_TAG);

    return {
      success: true,
      message: "Rascunho de pauta excluído com sucesso.",
      errors: null,
    };
  } catch (error) {
    console.error("deleteStoryAction error:", error);
    return {
      success: false,
      message: REQUEST_FAILED_MESSAGE,
      errors: null,
    };
  }
}
