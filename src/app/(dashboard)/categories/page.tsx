import { MasterDataManager } from "@/features/shared/components/master-data-manager"
import {
  createCategoryAction,
  deleteCategoryAction,
  listCategoriesAction,
  updateCategoryAction,
} from "@/features/categories/actions/category-actions"
import { getCategoriesByStore } from "@/features/categories/queries/get-categories-by-store"

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f"

export default async function CategoriesPage() {
  const categories = await getCategoriesByStore(DEMO_STORE_ID)

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
