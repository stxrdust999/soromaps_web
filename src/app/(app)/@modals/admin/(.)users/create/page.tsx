import type { adminGetUserResponse } from "@/http/users/users";
import { createFallbackPromise } from "@/utils/http/create-fallback-promise";

import { UserFormModal } from "../_components/user-form-modal";

export default function CreateUserModalPage() {
  const userPromise = createFallbackPromise<adminGetUserResponse>(undefined);

  const promises = { userPromise };

  return <UserFormModal promises={promises} />;
}
