"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2Icon, MapPinnedIcon, SaveIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import { createPlaceAction } from "@/actions/places";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { responseToast } from "@/lib/toaster";
import { createMarkerSchema } from "@/validations/markers";

/**
 * Placeholder vibes until the `Categoria` table exists — the real list comes
 * from the API once `/admin/categories` is built. Ver `docs/todo/admin/categories.md`.
 */
const VIBE_OPTIONS = [
  "Cafeteria",
  "Restaurante",
  "Bar",
  "Parque",
  "Point cultural",
  "Compras",
  "Vida noturna",
  "Outro",
] as const;

const DESCRIPTION_MAX_LENGTH = 160;
const SECRET_MAX_LENGTH = 200;

/**
 * Everything the finished screen asks for. Only the three fields of
 * `createMarkerSchema` reach the API — the rest is validated here so the
 * flow can be reviewed before the backend gains the columns. Ver
 * `docs/propostas/2026-08-03-expansao-modelo-ponto.md`.
 */
const createMarkerFormSchema = createMarkerSchema.extend({
  foto: z.custom<File>((value) => value instanceof File, {
    message: "Escolha uma foto do local",
  }),
  sobre: z
    .string()
    .trim()
    .min(1, "Conta rapidinho como é o lugar")
    .max(DESCRIPTION_MAX_LENGTH, `No máximo ${DESCRIPTION_MAX_LENGTH} letras`),
  vibe: z.enum(VIBE_OPTIONS, { message: "Escolha uma vibe" }),
  temWifi: z.boolean(),
  petFriendly: z.boolean(),
  melhorHorario: z.string().trim().max(60, "No máximo 60 letras").optional(),
  segredoLocal: z
    .string()
    .trim()
    .max(SECRET_MAX_LENGTH, `No máximo ${SECRET_MAX_LENGTH} letras`)
    .optional(),
});

type CreateMarkerFormSchema = z.infer<typeof createMarkerFormSchema>;

interface CreateMarkerFormProps {
  coords: { lat: number; lng: number };

  /** Volta pro estágio de escolher a posição do pin, sem perder o preenchido. */
  onChangeLocation: () => void;
  onSuccess: () => void;
}

/**
 * Segundo estágio da criação de local: a posição já foi confirmada e o
 * formulário coleta os dados. Só `nome`/`lat`/`lng` viajam pra API — os
 * outros campos existem para validar o fluxo antes de o schema crescer.
 */
export function CreateMarkerForm({
  coords,
  onChangeLocation,
  onSuccess,
}: CreateMarkerFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<CreateMarkerFormSchema>({
    resolver: zodResolver(createMarkerFormSchema),
    defaultValues: {
      nome: "",
      sobre: "",
      temWifi: false,
      petFriendly: false,
      melhorHorario: "",
      segredoLocal: "",
      ...coords,
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    // A coordenada muda quando o usuário volta e reposiciona o pin
    form.setValue("lat", coords.lat);
    form.setValue("lng", coords.lng);
  }, [coords.lat, coords.lng, form]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  async function onSubmitForm(data: CreateMarkerFormSchema) {
    const state = await createPlaceAction({
      categoryId: "00000000-0000-0000-0000-000000000000",
      name: data.nome,
      latitude: data.lat,
      longitude: data.lng,
      neighborhood: "Sorocaba",
      about: data.sobre || data.nome,
      description: data.sobre || data.nome,
      hasWifi: data.temWifi,
      isPetFriendly: data.petFriendly,
      bestTime: data.melhorHorario || null,
      localSecret: data.segredoLocal || null,
    });

    if (!state.success) {
      responseToast.error({
        title: "Erro ao criar local",
        description: state.message,
      });
      return;
    }

    responseToast.success({
      title: state.message,
      description: `${data.nome} já aparece no mapa.`,
    });

    onSuccess();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitForm)}
        className="flex flex-col gap-4"
      >
        <div className="-mr-2 max-h-[45vh] space-y-4 overflow-y-auto pr-2">
          <FormField
            control={form.control}
            name="foto"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Foto do local</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="file"
                    accept="image/*"
                    className="h-auto py-1.5"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      onChange(file);
                      setPhotoPreview(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                </FormControl>

                {photoPreview ? (
                  // biome-ignore lint/performance/noImgElement: blob local, next/image não otimiza
                  <img
                    src={photoPreview}
                    alt={`Pré-visualização de ${value?.name ?? "foto"}`}
                    className="h-28 w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-full items-center justify-center rounded-md border border-dashed text-muted-foreground">
                    <ImageIcon className="size-6" />
                  </div>
                )}

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do local</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Como chamam esse lugar?" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sobre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição breve</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    placeholder="Em poucas palavras, o que faz esse lugar valer a visita?"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vibe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria / vibe</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Qual é a vibe do rolê?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {VIBE_OPTIONS.map((vibe) => (
                      <SelectItem key={vibe} value={vibe}>
                        {vibe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="temWifi"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2.5">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">Tem wifi</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="petFriendly"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2.5">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">É petfriendly</FormLabel>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="melhorHorario"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Melhor horário para visitar</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Fim de tarde, evita o almoço…"
                  />
                </FormControl>
                <FormDescription>Opcional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="segredoLocal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Segredo local</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    maxLength={SECRET_MAX_LENGTH}
                    placeholder="Aquela dica que só quem é da cidade sabe…"
                  />
                </FormControl>
                <FormDescription>Opcional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onChangeLocation}
            disabled={isSubmitting}
          >
            <MapPinnedIcon className="size-4" />
            Trocar de lugar
          </Button>

          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <SaveIcon className="size-4" />
            )}
            Salvar local
          </Button>
        </div>
      </form>
    </Form>
  );
}
