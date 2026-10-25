import { UserFormModal } from "@/app/(app)/@modals/admin/(.)users/_components/user-form-modal";
import type { adminGetUserResponse } from "@/http/users/users";
import { createFallbackPromise } from "@/utils/http/create-fallback-promise";

/**
 * Direct URL access or F5 fallback for creating a user.
 * Renders the modal dialog component directly instead of redirecting.
 */
export default function CreateUserPage() {
  const userPromise = createFallbackPromise<adminGetUserResponse>(undefined);

  const promises = { userPromise };

  return <UserFormModal promises={promises} />;
}
