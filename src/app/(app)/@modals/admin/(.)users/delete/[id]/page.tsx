import { Suspense } from "react";

import { userShowTag } from "@/constants/users";
import { adminGetUser } from "@/http/users/users";

import { DeleteUserModal } from "../../_components/delete-user-modal";

interface DeleteUserModalPageProps {
  params: Promise<{ id: string }>;
}

export default async function DeleteUserModalPage({
  params,
}: DeleteUserModalPageProps) {
  const { id } = await params;

  const userPromise = adminGetUser(id, {
    next: { tags: [userShowTag(id)] },
  });

  const promises = { userPromise };

  return (
    <Suspense fallback={null}>
      <DeleteUserModal promises={promises} userId={id} />
    </Suspense>
  );
}
