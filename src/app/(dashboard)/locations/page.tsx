import { MasterDataManager } from "@/features/shared/components/master-data-manager"
import {
  createLocationAction,
  deleteLocationAction,
  listLocationsAction,
  updateLocationAction,
} from "@/features/locations/actions/location-actions"
import { getLocationsByStore } from "@/features/locations/queries/get-locations-by-store"
import { requireAuthContext } from "@/features/auth/queries/get-auth-context"

export default async function LocationsPage() {
  const auth = await requireAuthContext()
  if (!auth.activeStoreId) {
    throw new Error("Tài khoản chưa được gán cửa hàng")
  }
  const locations = await getLocationsByStore(auth.activeStoreId)

  return (
    <MasterDataManager
      role={auth.role}
      title="Kho"
      description="Quản lý danh sách kho và vị trí lưu trữ."
      entityLabel="kho"
      initialItems={locations}
      listAction={listLocationsAction}
      createAction={createLocationAction}
      updateAction={updateLocationAction}
      deleteAction={deleteLocationAction}
    />
  )
}
