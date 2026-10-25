import z from "zod";

const createUserSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().trim().min(1, "E-mail obrigatório").email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().trim().min(1, "E-mail obrigatório").email("E-mail inválido"),
  role: z.enum(["explorer", "admin"]).optional(),
  neighborhood: z.string().optional(),
  password: z.string().optional(),
});

const userFilterFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  neighborhood: z.string().optional(),
  createdAt: z.date().optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe sua senha atual"),
    newPassword: z
      .string()
      .min(8, "A nova senha deve ter no mínimo 8 caracteres")
      .max(100, "A nova senha deve ter no máximo 100 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const changeEmailSchema = z.object({
  newEmail: z.string().trim().email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe sua senha para confirmar a troca de e-mail"),
});

type CreateUserSchema = z.infer<typeof createUserSchema>;
type UpdateUserSchema = z.infer<typeof updateUserSchema>;
type UserFilterFormSchema = z.infer<typeof userFilterFormSchema>;
type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
type ChangeEmailSchema = z.infer<typeof changeEmailSchema>;

export {
  createUserSchema,
  updateUserSchema,
  userFilterFormSchema,
  changePasswordSchema,
  changeEmailSchema,
  type CreateUserSchema,
  type UpdateUserSchema,
  type UserFilterFormSchema,
  type ChangePasswordSchema,
  type ChangeEmailSchema,
};
