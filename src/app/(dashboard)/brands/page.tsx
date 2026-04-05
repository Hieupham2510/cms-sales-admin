import { MasterDataManager } from "@/features/shared/components/master-data-manager"
import {
  createBrandAction,
  deleteBrandAction,
  listBrandsAction,
  updateBrandAction,
} from "@/features/brands/actions/brand-actions"
import { getBrandsByStore } from "@/features/brands/queries/get-brands-by-store"

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f"

export default async function BrandsPage() {
  const brands = await getBrandsByStore(DEMO_STORE_ID)

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
