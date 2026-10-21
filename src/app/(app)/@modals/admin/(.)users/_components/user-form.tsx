"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { use, useMemo } from "react";
import { useForm } from "react-hook-form";

import { createUserAction, updateUserAction } from "@/actions/users";
import { PasswordInput } from "@/components/blocks/password-input";
import { Button } from "@/components/ui/button";
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
import type { adminGetUserResponse } from "@/http/users/users";
import { responseToast } from "@/lib/toaster";
import {
  type CreateUserSchema,
  type UpdateUserSchema,
  createUserSchema,
  updateUserSchema,
} from "@/validations/users";

interface UserFormProps {
  promises: {
    userPromise: Promise<adminGetUserResponse>;
  };

  isUpdating?: boolean;
  userId?: string;

  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({
  promises,
  isUpdating = false,
  userId,
  onSuccess,
  onCancel,
}: UserFormProps) {
  const userResponse = use(promises.userPromise);

  const defaultValues = useMemo<UpdateUserSchema>(() => {
    const user = userResponse.status === 200 ? userResponse.data : undefined;

    return {
      name: user?.name ?? "",
      email: user?.email ?? "",
      role: (user?.role?.toLowerCase() === "admin" ? "admin" : "explorer") as "admin" | "explorer",
      neighborhood: user?.neighborhood ?? "",
      password: "",
    };
  }, [userResponse]);

  const form = useForm<UpdateUserSchema>({
    resolver: zodResolver(isUpdating ? updateUserSchema : createUserSchema),
    defaultValues,
  });

  const { isSubmitting } = form.formState;

  async function onSubmitForm(data: UpdateUserSchema) {
    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("email", data.email);
    if (data.role) formData.set("role", data.role);
    if (data.neighborhood) formData.set("neighborhood", data.neighborhood);
    if (data.password) formData.set("password", data.password);

    const state = isUpdating
      ? await updateUserAction(formData, userId)
      : await createUserAction(formData);

    if (!state.success) {
      responseToast.error({
        title: isUpdating ? "Erro ao editar usuário" : "Erro ao criar usuário",
        description: state.message,
      });
      return;
    }

    responseToast.success({
      title: state.message,
      description: `O usuário ${data.name} foi salvo com sucesso.`,
    });

    form.reset();
    onSuccess();
  }

  return (
    <Form {...form}>
      <form
        id="form:submit"
        onSubmit={form.handleSubmit(onSubmitForm)}
        className="space-y-4"
      >
        {/* name - field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Digite o nome..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* email - field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="Digite o e-mail..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* role - field */}
        {isUpdating && (
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Papel</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o papel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="explorer">Explorador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* neighborhood - field */}
        {isUpdating && (
          <FormField
            control={form.control}
            name="neighborhood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Digite o bairro..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* password - field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {isUpdating ? "Nova Senha (opcional)" : "Senha"}
              </FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  placeholder={
                    isUpdating
                      ? "Deixe em branco para manter a atual..."
                      : "Digite uma senha..."
                  }
                />
              </FormControl>

              {isUpdating && (
                <FormDescription>
                  Preencha apenas se desejar redefinir a senha do usuário.
                </FormDescription>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-row justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <SaveIcon className="size-4" />
            )}
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  );
}
