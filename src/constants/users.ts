import type { UserFilterFormSchema } from "@/validations/users";

export const userListFilterDefaultValues: UserFilterFormSchema = {
  name: "",
  email: "",
  neighborhood: "",
  createdAt: undefined,
};

export const USERS_LIST_TAG = "list-users";
export const CURRENT_USER_TAG = "users-me";

export const userShowTag = (id: string) => `show-user-${id}`;

export const MODAL_CLOSE_DELAY_MS = 150;
