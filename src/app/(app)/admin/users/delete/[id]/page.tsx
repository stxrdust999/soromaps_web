import { Suspense } from "react";
import { DeleteUserModal } from "@/app/(app)/@modals/admin/(.)users/_components/delete-user-modal";
import { userShowTag } from "@/constants/users";
import { adminGetUser } from "@/http/users/users";

interface DeleteUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function DeleteUserPage({ params }: DeleteUserPageProps) {
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
