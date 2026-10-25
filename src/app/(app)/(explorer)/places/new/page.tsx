import { Suspense } from "react";

import { CATEGORIES_LIST_TAG } from "@/constants/categories";
import { listCategories } from "@/http/categories/categories";

import { NewPlaceSkeleton } from "./_components/new-place-skeleton";
import { NewPlaceWorkspace } from "./_components/new-place-workspace";

/**
 * Página de criação de local com carregamento de categorias em streaming via Suspense.
 */
export default function NewPlacePage() {
  const promises = {
    categoriesPromise: listCategories(
      { includeInactive: false, PageSize: 100 },
      { next: { tags: [CATEGORIES_LIST_TAG] } },
    ),
  };

  return (
    <Suspense fallback={<NewPlaceSkeleton />}>
      <NewPlaceWorkspace promises={promises} />
    </Suspense>
  );
}
