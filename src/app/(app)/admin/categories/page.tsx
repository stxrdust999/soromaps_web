import { Suspense } from "react";

import { PageBreadcrumb } from "@/components/blocks/page-breadcrumb";
import { CATEGORIES_LIST_TAG } from "@/constants/categories";
import { listCategories } from "@/http/categories/categories";
import { CategoriesSkeleton } from "./_components/categories-skeleton";
import { CategoriesWorkspace } from "./_components/categories-workspace";

/**
 * Administração de Categorias integrada à API via Streaming SSR.
 */
export default function AdminCategoriesPage() {
  const categoriesPromise = listCategories(
    { includeInactive: true },
    { next: { tags: [CATEGORIES_LIST_TAG] } },
  );

  return (
    <>
      <PageBreadcrumb items={[{ label: "Admin" }, { label: "Categorias" }]} />

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesWorkspace promises={{ categoriesPromise }} />
      </Suspense>
    </>
  );
}
