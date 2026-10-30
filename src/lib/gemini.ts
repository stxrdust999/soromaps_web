import { getEnv } from "@/config/env";

/**
 * Cliente mínimo da API do Gemini.
 *
 * **Só roda no servidor.** A chave vive em `GEMINI_API_KEY`, sem prefixo
 * `NEXT_PUBLIC_` — chave de modelo no bundle é chave de terceiro pagando a
 * conta de quem abrir o DevTools. Quem chama isto é Server Action, nunca
 * componente de cliente.
 *
 * Não lança: devolve envelope discriminado, como `src/http`. Falta de chave é
 * um estado esperado (ambiente sem a variável configurada), não exceção.
 */

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

/** Flash é o tier gratuito e o que dá vazão suficiente para redigir rascunho. */
const DEFAULT_MODEL = "gemini-2.0-flash";

/** Rascunho longo estoura o tempo da action antes de estourar o limite. */
const TIMEOUT_MS = 30_000;

export type GeminiResult =
  | { ok: true; data: unknown }
  | { ok: false; reason: "sem-chave" | "falha"; detail?: string };

/** Subconjunto do JSON Schema que a API aceita em `responseSchema`. */
export interface GeminiSchema {
  type: string;
  properties?: Record<string, unknown>;
  items?: unknown;
  required?: string[];
}

export interface StoryPromptInput {
  tema: string;
  places: string[];
}

interface GenerateJsonOptions {
  /** Regras de conduta do modelo — o que ele não pode inventar. */
  system: string;
  prompt: string;
  /** Força saída estruturada, então o retorno não precisa ser garimpado. */
  schema: GeminiSchema;
  /** Baixa para texto factual; o padrão da API é alto demais para isto. */
  temperature?: number;
}

export function geminiModel(): string {
  const { GEMINI_MODEL } = getEnv();
  return GEMINI_MODEL || DEFAULT_MODEL;
}

/**
 * Retorna um nome amigável e legível do modelo de IA para exibição na interface.
 */
export function geminiModelDisplayName(): string {
  const modelId = geminiModel().toLowerCase();
  if (modelId.includes("gemini")) return "Gemini";
  return "IA";
}

/**
 * Constrói o prompt editorial para o modelo Gemini, adaptando as instruções conforme a presença ou ausência de locais vinculados.
 */
export function buildPrompt(input: StoryPromptInput): string {
  if (input.places.length > 0) {
    return `Tema pedido pela comunidade: ${input.tema}

Escreva a pauta editorial explorando com entusiasmo os lugares abaixo, mantendo a ordem indicada e integrando os dados fornecidos:

${input.places.join("\n\n")}`;
  }

  return `Tema pedido pela comunidade: ${input.tema}

Redija uma crônica ou matéria urbana envolvente, fluida e calorosa sobre a vivência em Sorocaba, totalmente finalizada e pronta para publicação direta no feed. Não elabore notas de apuração ou instruções burocráticas; entregue o texto pronto para encantar e acolher os exploradores da cidade.`;
}

/**
 * Pede ao modelo um JSON no formato do schema.
 *
 * @param options Instrução de sistema, prompt, schema de saída e temperatura.
 * @returns Envelope com o JSON já parseado, ou o motivo da falha.
 */
export async function generateJson({
  system,
  prompt,
  schema,
  temperature = 0.4,
}: GenerateJsonOptions): Promise<GeminiResult> {
  const { GEMINI_API_KEY: apiKey } = getEnv();

  if (!apiKey) return { ok: false, reason: "sem-chave" };

  try {
    const response = await fetch(
      `${ENDPOINT}/${geminiModel()}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature,
          },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );

    if (!response.ok) {
      return {
        ok: false,
        reason: "falha",
        detail: `A API respondeu ${response.status}`,
      };
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof text !== "string") {
      return { ok: false, reason: "falha", detail: "Resposta vazia do modelo" };
    }

    return { ok: true, data: JSON.parse(text) };
  } catch (error) {
    console.error("gemini generateJson failed:", error);
    return { ok: false, reason: "falha" };
  }
}
