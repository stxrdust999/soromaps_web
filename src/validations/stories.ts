import z from "zod";

/** Parágrafos mínimos e máximos de uma pauta — abaixo disso é legenda. */
const MIN_PARAGRAPHS = 3;
const MAX_PARAGRAPHS = 6;

/** Lugares por pauta: menos de dois não é roteiro, mais de quatro não se lê. */
const MIN_PLACES = 2;
const MAX_PLACES = 4;

/**
 * Pedido de rascunho de pauta.
 *
 * O tema é livre, mas os lugares **não**: quem escolhe é a tela, a partir do
 * que existe no mapa. Deixar o modelo escolher o assunto sobre a cidade
 * inteira é o caminho mais curto para ele citar um estabelecimento que não
 * existe.
 */
const generateStorySchema = z.object({
  tema: z
    .string()
    .trim()
    .min(8, "Descreva o tema em pelo menos 8 caracteres")
    .max(160, "Tema muito longo — resuma em uma linha"),
  localIds: z
    .array(z.string().min(1))
    .min(MIN_PLACES, `Escolha ao menos ${MIN_PLACES} lugares`)
    .max(MAX_PLACES, `No máximo ${MAX_PLACES} lugares por pauta`),
});

/**
 * O que o modelo devolve. Revalidado com o mesmo rigor de entrada de usuário —
 * saída de LLM é entrada não confiável, mesmo com `responseSchema` na API.
 */
const storyDraftSchema = z.object({
  chapeu: z.string().trim().min(3).max(24),
  titulo: z.string().trim().min(10).max(90),
  chamada: z.string().trim().min(30).max(220),
  corpo: z
    .array(z.string().trim().min(80))
    .min(MIN_PARAGRAPHS)
    .max(MAX_PARAGRAPHS),
});

type GenerateStorySchema = z.infer<typeof generateStorySchema>;
type StoryDraftSchema = z.infer<typeof storyDraftSchema>;

/**
 * Validação para criação e publicação de pauta editorial.
 */
const publishStorySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, "O slug deve ter pelo menos 3 caracteres")
    .max(120, "O slug deve ter no máximo 120 caracteres"),
  title: z
    .string()
    .trim()
    .min(5, "O título deve ter pelo menos 5 caracteres")
    .max(140, "O título deve ter no máximo 140 caracteres"),
  subtitle: z
    .string()
    .trim()
    .min(10, "O subtítulo deve ter pelo menos 10 caracteres")
    .max(280, "O subtítulo deve ter no máximo 280 caracteres"),
  neighborhood: z.string().trim().max(60).optional().nullable(),
  introText: z
    .string()
    .trim()
    .min(20, "A introdução deve ter pelo menos 20 caracteres"),
  closingText: z.string().trim().optional().nullable(),
  publishImmediately: z.boolean().default(false),
  places: z
    .array(
      z.object({
        placeId: z.string().uuid("Identificador do local inválido"),
        angleTitle: z
          .string()
          .trim()
          .min(3, "O título do destaque do local é obrigatório")
          .max(120, "Máximo de 120 caracteres"),
        bodyText: z
          .string()
          .trim()
          .min(20, "O texto do local deve ter pelo menos 20 caracteres"),
        localTip: z.string().trim().max(280).optional().nullable(),
      }),
    )
    .min(MIN_PLACES, `Vincule ao menos ${MIN_PLACES} locais na pauta`)
    .max(MAX_PLACES, `No máximo ${MAX_PLACES} locais por pauta`),
});

type PublishStorySchema = z.infer<typeof publishStorySchema>;

/**
 * Validação para edição e atualização de uma pauta editorial existente.
 */
const updateStorySchema = publishStorySchema.extend({
  id: z.string().uuid("Identificador da pauta inválido"),
});

type UpdateStorySchema = z.infer<typeof updateStorySchema>;

export {
  generateStorySchema,
  storyDraftSchema,
  publishStorySchema,
  updateStorySchema,
  MAX_PLACES,
  MIN_PLACES,
  type GenerateStorySchema,
  type StoryDraftSchema,
  type PublishStorySchema,
  type UpdateStorySchema,
};
