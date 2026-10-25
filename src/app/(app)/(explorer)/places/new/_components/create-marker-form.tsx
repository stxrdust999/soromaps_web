"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, MapPinnedIcon, SaveIcon } from "lucide-react";
import { use, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import {
  confirmPlacePhotoAction,
  createPlaceAction,
  createPlacePhotoUploadUrlAction,
} from "@/actions/places";
import { FileUploadDropzone } from "@/components/blocks/file-upload-dropzone";
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
import type { listCategoriesResponse } from "@/http/categories/categories";
import { responseToast } from "@/lib/toaster";
import { createMarkerSchema } from "@/validations/markers";

const DESCRIPTION_MAX_LENGTH = 160;
const SECRET_MAX_LENGTH = 200;
const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const createMarkerFormSchema = createMarkerSchema.extend({
  foto: z
    .custom<File>((value) => value === undefined || value instanceof File)
    .refine(
      (file) => !file || file.size <= MAX_IMAGE_SIZE_BYTES,
      "A foto deve ter no máximo 15 MB",
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Formato inválido. Aceitos: JPG, PNG ou WebP",
    )
    .optional(),
  bairro: z
    .string()
    .trim()
    .min(2, "Informe o bairro do local")
    .max(80, "No máximo 80 caracteres"),
  sobre: z
    .string()
    .trim()
    .min(1, "Conta rapidinho como é o lugar")
    .max(DESCRIPTION_MAX_LENGTH, `No máximo ${DESCRIPTION_MAX_LENGTH} letras`),
  categoryId: z.string().min(1, "Escolha uma categoria"),
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
  promises: {
    categoriesPromise: Promise<listCategoriesResponse>;
  };
  onChangeLocation: () => void;
  onSuccess: () => void;
}

/**
 * Formulário de cadastro de novo local no mapa resolvendo categorias reais via React.use() + useMemo().
 */
export function CreateMarkerForm({
  coords,
  promises,
  onChangeLocation,
  onSuccess,
}: CreateMarkerFormProps) {
  const categoriesResponse = use(promises.categoriesPromise);

  const categories = useMemo(() => {
    const items =
      categoriesResponse.status === 200
        ? (categoriesResponse.data.items ?? [])
        : [];
    return items.filter((category) => category.isActive);
  }, [categoriesResponse]);

  const form = useForm<CreateMarkerFormSchema>({
    resolver: zodResolver(createMarkerFormSchema),
    defaultValues: {
      nome: "",
      bairro: "",
      sobre: "",
      categoryId: categories[0]?.id ?? "",
      temWifi: false,
      petFriendly: false,
      melhorHorario: "",
      segredoLocal: "",
      ...coords,
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    form.setValue("lat", coords.lat);
    form.setValue("lng", coords.lng);
  }, [coords.lat, coords.lng, form]);

  /** Sincroniza o valor de categoryId caso as categorias sejam carregadas após a inicialização. */
  useEffect(() => {
    const currentCategoryId = form.getValues("categoryId");
    if (!currentCategoryId && categories.length > 0 && categories[0]?.id) {
      form.setValue("categoryId", categories[0].id, { shouldValidate: true });
    }
  }, [categories, form]);

  async function onSubmitForm(data: CreateMarkerFormSchema) {
    const state = await createPlaceAction({
      categoryId: data.categoryId,
      name: data.nome,
      latitude: data.lat,
      longitude: data.lng,
      neighborhood: data.bairro,
      about: data.sobre,
      description: data.sobre,
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

    /** Uploads cover photo to Supabase Storage if the user attached a file. */
    if (data.foto instanceof File && state.placeId) {
      const extension = data.foto.name.split(".").pop() ?? "jpg";
      const uploadUrlResult = await createPlacePhotoUploadUrlAction(
        state.placeId,
        extension,
      );

      if (uploadUrlResult.success && uploadUrlResult.data) {
        try {
          const uploadResponse = await fetch(uploadUrlResult.data.uploadUrl, {
            method: "PUT",
            body: data.foto,
            headers: {
              "Content-Type": data.foto.type || "image/jpeg",
            },
          });

          if (uploadResponse.ok) {
            await confirmPlacePhotoAction(
              state.placeId,
              uploadUrlResult.data.publicUrl,
              uploadUrlResult.data.storagePath,
              true,
            );
          }
        } catch {
          // O local já foi criado; falha eventual no upload da foto não invalida o cadastro
        }
      }
    }

    responseToast.success({
      title: state.message,
      description: `${data.nome} foi enviado para análise da moderação.`,
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
          {/* foto - field */}
          <FormField
            control={form.control}
            name="foto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Foto do local (opcional)</FormLabel>
                <FormControl>
                  <FileUploadDropzone
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* nome - field */}
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

          {/* bairro - field */}
          <FormField
            control={form.control}
            name="bairro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ex.: Centro, Santa Rosália, Campolim..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* sobre - field */}
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

          {/* categoryId - field */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Escolha a categoria do local" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent position="popper" sideOffset={4}>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* amenities - section */}
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
                  <FormLabel className="font-normal">Tem wi-fi</FormLabel>
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
                  <FormLabel className="font-normal">É pet friendly</FormLabel>
                </FormItem>
              )}
            />
          </div>

          {/* melhorHorario - field */}
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

          {/* segredoLocal - field */}
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

        {/* actions - section */}
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
