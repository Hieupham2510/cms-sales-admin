import { MasterDataManager } from "@/features/shared/components/master-data-manager"
import {
  createBrandAction,
  deleteBrandAction,
  listBrandsAction,
  updateBrandAction,
} from "@/features/brands/actions/brand-actions"
import { getBrandsByStore } from "@/features/brands/queries/get-brands-by-store"
import { getActiveStoreIdOrThrow } from "@/features/auth/queries/get-auth-context"

export default async function BrandsPage() {
  const storeId = await getActiveStoreIdOrThrow()
  const brands = await getBrandsByStore(storeId)

  return (
    <MasterDataManager
      title="Thương hiệu"
      description="Quản lý danh sách thương hiệu của cửa hàng."
      entityLabel="thương hiệu"
      initialItems={brands}
      listAction={listBrandsAction}
      createAction={createBrandAction}
      updateAction={updateBrandAction}
      deleteAction={deleteBrandAction}
    />
  )
}
