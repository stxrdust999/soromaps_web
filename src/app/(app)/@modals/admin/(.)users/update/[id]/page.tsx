import { userShowTag } from "@/constants/users";
import { adminGetUser } from "@/http/users/users";

import { UserFormModal } from "../../_components/user-form-modal";

interface UpdateUserModalPageProps {
  params: Promise<{ id: string }>;
}

export default async function UpdateUserModalPage({
  params,
}: UpdateUserModalPageProps) {
  const { id } = await params;

  const userPromise = adminGetUser(id, {
    next: { tags: [userShowTag(id)] },
  });

  const promises = { userPromise };

  return <UserFormModal promises={promises} isUpdating userId={id} />;
}
