import { MasterDataManager } from "@/features/shared/components/master-data-manager"
import {
  createCategoryAction,
  deleteCategoryAction,
  listCategoriesAction,
  updateCategoryAction,
} from "@/features/categories/actions/category-actions"
import { getCategoriesByStore } from "@/features/categories/queries/get-categories-by-store"
import { getActiveStoreIdOrThrow } from "@/features/auth/queries/get-auth-context"

export default async function CategoriesPage() {
  const storeId = await getActiveStoreIdOrThrow()
  const categories = await getCategoriesByStore(storeId)

  return (
    <MasterDataManager
      title="Nhóm hàng"
      description="Quản lý nhóm hàng để phân loại sản phẩm."
      entityLabel="nhóm hàng"
      initialItems={categories}
      listAction={listCategoriesAction}
      createAction={createCategoryAction}
      updateAction={updateCategoryAction}
      deleteAction={deleteCategoryAction}
    />
  )
}
