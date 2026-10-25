"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  QuoteIcon,
  SearchIcon,
  SparklesIcon,
  TriangleAlertIcon,
  UsersIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import { AchievementBadge } from "@/components/ui/achievement-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACHIEVEMENT_COLORS,
  ACHIEVEMENT_EVENT_KEYS,
  ACHIEVEMENT_EVENTS,
  ACHIEVEMENT_ICON_KEYS,
  ACHIEVEMENT_ICONS,
  type AchievementEventKey,
  type AchievementTargetKind,
  TARGET_LABEL,
  TRIGGER_LABEL,
} from "@/constants/achievements";
import { estimateAchievementAction } from "@/actions/achievements";
import { estimateReach, formatCriterion } from "@/helpers/achievement-criteria";
import { cn } from "@/lib/utils";
import type { AchievementMock } from "@/types/achievements";
import {
  type AchievementFormSchema,
  achievementFormSchema,
} from "@/validations/achievements";

/** Sentinela do "sem alvo" — `Select` do Radix não aceita valor vazio. */
const NO_TARGET = "nenhum";

interface FormEventDefinition {
  label: string;
  verbo: string;
  substantivo: string;
  substantivoSingular: string;
  trigger: "metric" | "api" | "streak";
  alvos: AchievementTargetKind[];
}

const CATALOG_ACHIEVEMENT_EVENTS: Record<string, FormEventDefinition> = {
  ...ACHIEVEMENT_EVENTS,
  comentar: {
    label: "Comentar",
    verbo: "Escrever",
    substantivo: "comentários",
    substantivoSingular: "comentário",
    trigger: "metric",
    alvos: ["categoria", "bairro"],
  },
};

const CONFIGURABLE_EVENT_KEYS = [
  "visitar",
  "avaliar",
  "favoritar",
  "criar",
  "comentar",
] as const;

const dialogAchievementFormSchema = z
  .object({
    nome: z.string().trim().min(1, "Nome obrigatório"),
    descricao: z.string().trim().min(1, "Descrição obrigatória"),
    icone: z.enum(ACHIEVEMENT_ICON_KEYS),
    cor: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "Use uma cor em hexadecimal, ex.: #1447e6"),
    evento: z.string().min(1, "Evento obrigatório"),
    quantidade: z
      .number()
      .int("Use um número inteiro")
      .min(1, "A quantidade precisa ser pelo menos 1"),
    tipoAlvo: z.enum(["categoria", "bairro"]).nullable(),
    alvo: z.string().nullable(),
    ativa: z.boolean(),
  })
  .superRefine((formValues, context) => {
    if (formValues.tipoAlvo && !formValues.alvo) {
      context.addIssue({
        code: "custom",
        path: ["alvo"],
        message: "Escolha o alvo para o critério fechar",
      });
    }
  });

type DialogAchievementFormData = z.infer<typeof dialogAchievementFormSchema>;

const EMPTY_FORM: DialogAchievementFormData = {
  nome: "",
  descricao: "",
  icone: "award",
  cor: ACHIEVEMENT_COLORS[0],
  evento: "visitar",
  quantidade: 5,
  tipoAlvo: "categoria",
  alvo: "Cafeteria",
  ativa: true,
};

interface AchievementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` cria; conquista preenchida edita. */
  achievement: AchievementMock | null;
  categories: string[];
  neighborhoods: string[];
  onSubmit: (values: AchievementFormSchema) => void;
  onPreviewUnlock: (values: AchievementFormSchema) => void;
}

/** Criar e editar conquista, com o critério declarativo e a prévia ao vivo. */
export function AchievementFormDialog({
  open,
  onOpenChange,
  achievement,
  categories,
  neighborhoods,
  onSubmit,
  onPreviewUnlock,
}: AchievementFormDialogProps) {
  const [iconQuery, setIconQuery] = useState("");
  const [apiReach, setApiReach] = useState<number | null>(null);

  const form = useForm<DialogAchievementFormData>({
    resolver: zodResolver(dialogAchievementFormSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (!open) return;

    form.reset(
      achievement
        ? {
            nome: achievement.nome,
            descricao: achievement.descricao,
            icone: achievement.icone,
            cor: achievement.cor,
            evento: achievement.evento,
            quantidade: achievement.quantidade,
            tipoAlvo: achievement.tipoAlvo,
            alvo: achievement.alvo,
            ativa: achievement.ativa,
          }
        : {
            ...EMPTY_FORM,
            alvo: categories[0] ?? "Cafeteria",
          },
    );
    setIconQuery("");
  }, [open, achievement, categories, form]);

  const values = form.watch();
  const definition =
    CATALOG_ACHIEVEMENT_EVENTS[values.evento] ??
    CATALOG_ACHIEVEMENT_EVENTS.visitar;
  const trigger = TRIGGER_LABEL[definition.trigger];

  const criterion = {
    evento: values.evento as AchievementEventKey,
    quantidade: values.quantidade,
    tipoAlvo: values.tipoAlvo,
    alvo: values.alvo,
  };

  const phrase = useMemo(() => {
    if (values.evento === "comentar") {
      if (!Number.isFinite(values.quantidade) || values.quantidade < 1) return null;
      if (values.tipoAlvo && !values.alvo) return null;
      const noun =
        values.quantidade === 1
          ? definition.substantivoSingular
          : definition.substantivo;
      const tail =
        values.tipoAlvo && values.alvo
          ? ` ${TARGET_LABEL[values.tipoAlvo]} ${values.alvo}`
          : "";
      return `${definition.verbo} ${values.quantidade} ${noun}${tail}`;
    }
    return formatCriterion(criterion);
  }, [
    values.evento,
    values.quantidade,
    values.tipoAlvo,
    values.alvo,
    definition,
    criterion,
  ]);

  useEffect(() => {
    if (!open || !phrase) {
      setApiReach(null);
      return;
    }

    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      const response = await estimateAchievementAction({
        evento: values.evento,
        quantidade: values.quantidade,
        tipoAlvo: values.tipoAlvo,
        alvo: values.alvo,
      });

      if (!cancelled && response)
        setApiReach(Number(response.estimatedEligibleCount ?? 0));
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [
    open,
    phrase,
    values.evento,
    values.quantidade,
    values.tipoAlvo,
    values.alvo,
  ]);

  const reach = phrase
    ? (apiReach ??
        (values.evento === "comentar"
          ? Math.max(
              Math.round(
                (750 * (values.tipoAlvo ? 0.32 : 1)) /
                  values.quantidade ** 1.35,
              ),
              0,
            )
          : estimateReach(criterion)))
    : null;

  const targetOptions =
    values.tipoAlvo === "bairro" ? neighborhoods : categories;


  const icons = ACHIEVEMENT_ICON_KEYS.filter((key) =>
    key.includes(iconQuery.trim().toLowerCase()),
  );

  const previewName = values.nome || "Nova conquista";
  const previewDescription =
    values.descricao || "Descrição que o jogador lê no app";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-235">
        <DialogHeader className="border-b p-6">
          <DialogTitle>
            {achievement ? "Editar conquista" : "Nova conquista"}
          </DialogTitle>
          <DialogDescription>
            Três campos definem o critério. Nada aqui exige deploy.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="achievement-form"
            onSubmit={form.handleSubmit((formValues) =>
              onSubmit(formValues as unknown as AchievementFormSchema),
            )}
            className="grid max-h-[64vh] overflow-auto md:grid-cols-[1.1fr_1fr]"
          >
            <div className="flex flex-col gap-5 p-6 md:border-r">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex.: Caçador de Cafés" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Frase curta que o jogador lê no app"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icone"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-3">
                      <FormLabel>Ícone</FormLabel>

                      <div className="relative w-40">
                        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                        <Input
                          value={iconQuery}
                          onChange={(event) => setIconQuery(event.target.value)}
                          placeholder="Buscar ícone"
                          className="h-8 pl-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid max-h-28 grid-cols-9 gap-1.5 overflow-auto p-0.5">
                      {icons.map((key) => {
                        const Icon = ACHIEVEMENT_ICONS[key];
                        const selected = field.value === key;

                        return (
                          <button
                            key={key}
                            type="button"
                            title={key}
                            aria-pressed={selected}
                            onClick={() => field.onChange(key)}
                            className={cn(
                              "text-muted-foreground hover:bg-accent flex h-9 items-center justify-center rounded-md border transition-colors",
                              selected && "border-primary text-primary",
                            )}
                          >
                            <Icon className="size-4" />
                          </button>
                        );
                      })}
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <FormControl>
                      <ColorPicker
                        value={field.value}
                        onChange={field.onChange}
                        presets={ACHIEVEMENT_COLORS}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-2.5 rounded-lg border p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">Critério</span>

                  <Badge variant="secondary">
                    <trigger.icon size={12} />
                    <span className="text-xs font-light">
                      Gatilho: {trigger.label}
                    </span>
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <FormField
                    control={form.control}
                    name="evento"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);

                          const targetDefinition =
                            CATALOG_ACHIEVEMENT_EVENTS[value];
                          const allowed: AchievementTargetKind[] =
                            targetDefinition?.alvos ?? [];

                          if (
                            values.tipoAlvo &&
                            !allowed.includes(values.tipoAlvo)
                          ) {
                            form.setValue("tipoAlvo", null);
                            form.setValue("alvo", null);
                          }
                        }}
                      >
                        <SelectTrigger size="sm" aria-label="Evento">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {CONFIGURABLE_EVENT_KEYS.map((key) => (
                            <SelectItem key={key} value={key}>
                              {CATALOG_ACHIEVEMENT_EVENTS[key].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantidade"
                    render={({ field }) => (
                      <FormControl>
                        <Input
                          value={field.value}
                          onChange={(event) =>
                            field.onChange(
                              Number(event.target.value.replace(/\D/g, "")) ||
                                0,
                            )
                          }
                          inputMode="numeric"
                          aria-label="Quantidade"
                          className="h-8 w-16 text-center tabular-nums"
                        />
                      </FormControl>
                    )}
                  />

                  <span className="text-muted-foreground text-sm">
                    {definition.substantivo}
                  </span>

                  <FormField
                    control={form.control}
                    name="tipoAlvo"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? NO_TARGET}
                        onValueChange={(value) => {
                          const kind =
                            value === NO_TARGET
                              ? null
                              : (value as AchievementTargetKind);

                          field.onChange(kind);
                          form.setValue(
                            "alvo",
                            kind === "bairro"
                              ? (neighborhoods[0] ?? null)
                              : kind === "categoria"
                                ? (categories[0] ?? null)
                                : null,
                          );
                        }}
                      >
                        <SelectTrigger size="sm" aria-label="Tipo de alvo">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value={NO_TARGET}>sem alvo</SelectItem>

                          {definition.alvos.map((kind) => (
                            <SelectItem key={kind} value={kind}>
                              {TARGET_LABEL[kind]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {values.tipoAlvo && (
                    <FormField
                      control={form.control}
                      name="alvo"
                      render={({ field }) => (
                        <Select
                          value={field.value ?? ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger size="sm" aria-label="Alvo">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>

                          <SelectContent>
                            {targetOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                </div>

                <p
                  className={cn(
                    "flex items-start gap-2 rounded-md p-2.5 text-sm font-semibold",
                    phrase
                      ? "bg-primary/10 text-primary"
                      : "bg-warning/10 text-warning",
                  )}
                >
                  {phrase ? (
                    <QuoteIcon size={14} className="mt-0.5 shrink-0" />
                  ) : (
                    <TriangleAlertIcon size={14} className="mt-0.5 shrink-0" />
                  )}
                  {phrase ??
                    "Critério incompleto — escolha o alvo para a frase fechar."}
                </p>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border p-3">
                <UsersIcon
                  size={15}
                  className="text-muted-foreground mt-0.5 shrink-0"
                />

                <div>
                  <p className="text-sm font-medium">Estimativa de alcance</p>
                  <p
                    className={cn(
                      "text-sm",
                      reach === 0 ? "text-warning" : "text-muted-foreground",
                    )}
                  >
                    {reach === null
                      ? "Complete o critério para estimar o alcance."
                      : reach === 0
                        ? "Com os dados de hoje, ninguém cumpriria este critério."
                        : `Com os dados de hoje, ${reach.toLocaleString("pt-BR")} ${reach === 1 ? "usuário já cumpriria" : "usuários já cumpririam"} este critério.`}
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="ativa"
                render={({ field }) => (
                  <FormItem>
                    <Label className="flex cursor-pointer items-start gap-3 font-normal">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                          className="mt-0.5"
                        />
                      </FormControl>

                      <span>
                        <span className="block text-sm font-medium">
                          Conquista ativa
                        </span>
                        <span className="text-muted-foreground block text-xs">
                          Inativa não é concedida nem aparece no catálogo do
                          app.
                        </span>
                      </span>
                    </Label>
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-muted/30 flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground text-sm">
                  Pré-visualização
                </span>
                <span className="text-muted-foreground font-mono text-[10.5px]">
                  UserAchievement sintético
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background flex flex-col items-center gap-2.5 rounded-lg border p-4">
                  <AchievementBadge
                    layout="icon"
                    badgeSize="xl"
                    achievement={{
                      id: "preview-locked",
                      name: previewName,
                      trigger: definition.trigger,
                      icon: values.icone,
                      color: values.cor,
                      achievedAt: null,
                    }}
                  />

                  <div className="text-center">
                    <p className="text-muted-foreground text-sm font-semibold">
                      Travada
                    </p>
                    <p className="text-muted-foreground font-mono text-[10.5px]">
                      achievedAt: null
                    </p>
                  </div>
                </div>

                <div className="bg-background flex flex-col items-center gap-2.5 rounded-lg border p-4">
                  <AchievementBadge
                    layout="icon"
                    badgeSize="xl"
                    achievement={{
                      id: "preview-unlocked",
                      name: previewName,
                      trigger: definition.trigger,
                      icon: values.icone,
                      color: values.cor,
                      achievedAt: "hoje",
                    }}
                  />

                  <div className="text-center">
                    <p className="text-sm font-semibold">Desbloqueada</p>
                    <p className="text-muted-foreground font-mono text-[10.5px]">
                      achievedAt: hoje
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-xs">
                  Na lista do jogador · progresso 60%
                </span>

                <div className="bg-background flex items-center gap-3 rounded-lg border p-3">
                  <AchievementBadge
                    layout="icon"
                    badgeSize="sm"
                    achievement={{
                      id: "preview-row",
                      name: previewName,
                      trigger: definition.trigger,
                      icon: values.icone,
                      color: values.cor,
                      achievedAt: null,
                    }}
                  />

                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <p className="text-sm font-semibold">{previewName}</p>
                    <p className="text-muted-foreground text-xs">
                      {previewDescription}
                    </p>

                    <div className="bg-muted h-1 overflow-hidden rounded-full">
                      <div
                        className="h-full w-3/5 rounded-full"
                        style={{ backgroundColor: values.cor }}
                      />
                    </div>

                    <p className="text-muted-foreground text-[11.5px] tabular-nums">
                      {Math.round(values.quantidade * 0.6)} de{" "}
                      {values.quantidade}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  onPreviewUnlock(values as unknown as AchievementFormSchema)
                }
              >
                <SparklesIcon />
                Ver como o jogador vê
              </Button>
            </div>
          </form>
        </Form>

        <DialogFooter className="border-t p-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" form="achievement-form">
            Salvar conquista
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
