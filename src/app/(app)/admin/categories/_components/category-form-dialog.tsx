"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SearchIcon, TriangleAlertIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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
  CATEGORY_COLORS,
  CATEGORY_ICON_KEYS,
  CATEGORY_ICONS,
  type CategoryIconKey,
} from "@/constants/categories";
import { cn } from "@/lib/utils";
import { slugify } from "@/utils/formatters/slugify";
import {
  type CategoryFormSchema,
  categoryFormSchema,
} from "@/validations/categories";
import type { CategoryViewModel } from "./use-categories";
import { CategoryPin } from "./category-pin";
import { findColorCollision } from "./use-categories";

const EMPTY_FORM: CategoryFormSchema = {
  nome: "",
  cor: CATEGORY_COLORS[CATEGORY_COLORS.length - 1],
  icone: "map-pin",
  ativa: true,
};

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` cria; categoria preenchida edita. */
  category: CategoryViewModel | null;
  categories: CategoryViewModel[];
  onSubmit: (values: CategoryFormSchema) => void;
}

/** Criar e editar categoria, com pré-visualização ao vivo do resultado. */
export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  categories,
  onSubmit,
}: CategoryFormDialogProps) {
  const [iconQuery, setIconQuery] = useState("");

  const form = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: EMPTY_FORM,
  });

  // O diálogo não desmonta entre aberturas, então sem este reset a segunda
  // "Nova categoria" abriria com o que ficou da edição anterior.
  useEffect(() => {
    if (!open) return;

    form.reset(
      category
        ? {
            nome: category.nome,
            cor: category.cor,
            icone: category.icone,
            ativa: category.ativa,
          }
        : EMPTY_FORM,
    );
    setIconQuery("");
  }, [open, category, form]);

  const values = form.watch();
  const [collisionColor, setCollisionColor] = useState(
    category?.cor ?? EMPTY_FORM.cor,
  );

  useEffect(() => {
    if (!open) return;
    setCollisionColor(category?.cor ?? EMPTY_FORM.cor);
  }, [open, category]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCollisionColor(values.cor);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [values.cor]);

  const collision = findColorCollision(categories, collisionColor, category?.id);
  const slug = slugify(values.nome);

  const icons = CATEGORY_ICON_KEYS.filter((key) =>
    key.includes(iconQuery.trim().toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-225">
        <DialogHeader className="border-b p-6">
          <DialogTitle>
            {category ? "Editar categoria" : "Nova categoria"}
          </DialogTitle>
          <DialogDescription>
            Ícone e cor definem como o ponto aparece no mapa e nos filtros.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="category-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid max-h-[62vh] overflow-auto md:grid-cols-2"
          >
            <div className="flex flex-col gap-5 p-6 md:border-r">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex.: Cafeteria" />
                    </FormControl>
                    <FormMessage />

                    <p className="text-muted-foreground text-xs">
                      Vira o filtro{" "}
                      <span className="font-mono">
                        /discover?categoria={slug || "…"}
                      </span>{" "}
                      — gerado do nome, não editável.
                    </p>
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

                    <div className="grid max-h-36 grid-cols-8 gap-1.5 overflow-auto p-0.5">
                      {icons.map((key) => {
                        const Icon = CATEGORY_ICONS[key];
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
                    <FormLabel>Cor da Categoria</FormLabel>
                    <FormControl>
                      <ColorPicker
                        inline
                        value={field.value}
                        onChange={field.onChange}
                        onChangeEnd={(confirmedHex) =>
                          setCollisionColor(confirmedHex)
                        }
                        presets={CATEGORY_COLORS}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          Categoria ativa
                        </span>
                        <span className="text-muted-foreground block text-xs">
                          Inativa some do filtro do app, mas mantém os pontos.
                        </span>
                      </span>
                    </Label>
                  </FormItem>
                )}
              />

              {collision && (
                <p className="border-warning/40 bg-warning/10 text-warning flex items-start gap-2 rounded-lg border p-3 text-xs">
                  <TriangleAlertIcon className="mt-px size-3.5 shrink-0" />
                  <span>
                    Essa cor está muito próxima de{" "}
                    <strong>{collision.nome}</strong>. No mapa os dois pins vão
                    se confundir.
                  </span>
                </p>
              )}
            </div>

            <CategoryPreview
              nome={values.nome || "Nova categoria"}
              cor={values.cor}
              icone={values.icone as CategoryIconKey}
            />
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
          <Button type="submit" form="category-form">
            Salvar categoria
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CategoryPreviewProps {
  nome: string;
  cor: string;
  icone: CategoryIconKey;
}

/**
 * Metade direita do diálogo: o mesmo par ícone/cor nos três lugares onde ele
 * aparece para o usuário final. É o que impede o admin de descobrir o problema
 * só depois de publicar.
 */
function CategoryPreview({ nome, cor, icone }: CategoryPreviewProps) {
  const Icon = CATEGORY_ICONS[icone] ?? CATEGORY_ICONS["map-pin"];

  return (
    <div className="bg-muted/30 flex flex-col gap-4 p-6">
      <span className="text-muted-foreground text-sm">Pré-visualização</span>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs">No mapa</span>

        <div className="bg-muted/40 relative flex h-37 items-center justify-center gap-4 overflow-hidden rounded-lg border">
          <svg
            viewBox="0 0 400 150"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
            aria-hidden="true"
          >
            <g className="stroke-border/60" strokeWidth={8}>
              <path d="M-10 44 L410 32" />
              <path d="M-10 100 L410 88" />
              <path d="M110 -10 L130 160" />
              <path d="M280 -10 L300 160" />
            </g>
          </svg>

          <span className="bg-muted-foreground/45 relative size-4 -rotate-45 rounded-[50%_50%_50%_0]" />
          <CategoryPin
            icone={icone}
            cor={cor}
            size={38}
            ring
            className="relative"
          />
          <span className="bg-muted-foreground/45 relative size-4 -rotate-45 rounded-[50%_50%_50%_0]" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs">Chip de filtro</span>

        <div className="flex flex-wrap gap-2">
          <span
            className="flex h-7.5 items-center gap-2 rounded-full px-3 text-sm font-medium text-white"
            style={{ backgroundColor: cor }}
          >
            <Icon className="size-3.5" />
            {nome}
          </span>
          <span className="text-muted-foreground flex h-7.5 items-center rounded-full border px-3 text-sm">
            Parque
          </span>
          <span className="text-muted-foreground flex h-7.5 items-center rounded-full border px-3 text-sm">
            Bar
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs">Card de local</span>

        <div className="bg-card flex gap-3 rounded-lg border p-3">
          <div className="bg-muted size-16 shrink-0 rounded-md" />

          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-sm font-semibold">Cabocafé</span>

            <div className="flex items-center gap-2">
              <span
                className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{
                  color: cor,
                  backgroundColor: `color-mix(in oklab, ${cor} 14%, transparent)`,
                }}
              >
                <Icon className="size-3" />
                {nome}
              </span>
              <span className="text-muted-foreground text-xs">
                Santa Rosália · 250 m
              </span>
            </div>

            <span className="text-muted-foreground text-xs">
              Torra própria e mesa na calçada.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
