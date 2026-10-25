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

type CreateUserSchema = z.infer<typeof createUserSchema>;
type UpdateUserSchema = z.infer<typeof updateUserSchema>;
type UserFilterFormSchema = z.infer<typeof userFilterFormSchema>;

export {
  createUserSchema,
  updateUserSchema,
  userFilterFormSchema,
  type CreateUserSchema,
  type UpdateUserSchema,
  type UserFilterFormSchema,
};
