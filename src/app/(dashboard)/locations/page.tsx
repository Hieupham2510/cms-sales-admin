import { MasterDataManager } from "@/features/shared/components/master-data-manager"
import {
  createLocationAction,
  deleteLocationAction,
  listLocationsAction,
  updateLocationAction,
} from "@/features/locations/actions/location-actions"
import { getLocationsByStore } from "@/features/locations/queries/get-locations-by-store"

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f"

export default async function LocationsPage() {
  const locations = await getLocationsByStore(DEMO_STORE_ID)

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
