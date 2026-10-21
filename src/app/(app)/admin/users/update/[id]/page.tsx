import { UserFormModal } from "@/app/(app)/@modals/admin/(.)users/_components/user-form-modal";
import { userShowTag } from "@/constants/users";
import { adminGetUser } from "@/http/users/users";

interface UpdateUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function UpdateUserPage({ params }: UpdateUserPageProps) {
  const { id } = await params;

  const userPromise = adminGetUser(id, {
    next: { tags: [userShowTag(id)] },
  });

  const promises = { userPromise };

  return <UserFormModal promises={promises} isUpdating userId={id} />;
}
