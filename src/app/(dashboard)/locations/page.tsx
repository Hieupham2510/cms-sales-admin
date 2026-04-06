import { MasterDataManager } from "@/features/shared/components/master-data-manager"
import {
  createLocationAction,
  deleteLocationAction,
  listLocationsAction,
  updateLocationAction,
} from "@/features/locations/actions/location-actions"
import { getLocationsByStore } from "@/features/locations/queries/get-locations-by-store"
import { getActiveStoreIdOrThrow } from "@/features/auth/queries/get-auth-context"

export default async function LocationsPage() {
  const storeId = await getActiveStoreIdOrThrow()
  const locations = await getLocationsByStore(storeId)

  return (
    <MasterDataManager
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
