import { SalesDashboard } from "@/components/dashboard/sales-dashboard"
import { getAuthContext } from "@/features/auth/queries/get-auth-context"
import { getSalesDashboardData } from "@/features/dashboard/queries/get-sales-dashboard-data"
import { redirect } from "next/navigation"

type Props = {
  searchParams?: Promise<{
    from?: string
    to?: string
  }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const auth = await getAuthContext()
  if (!auth) {
    redirect("/login")
  }

  if (auth.role === "staff") {
    redirect("/staff-home")
  }

  const activeStore = auth.allowedStores.find((store) => store.id === auth.activeStoreId) ?? null
  if (!activeStore) {
    redirect("/settings")
  }

  const params = (await searchParams) ?? {}
  const dashboardData = await getSalesDashboardData({
    storeId: activeStore.id,
    from: params.from,
    to: params.to,
  })

  return (
    <SalesDashboard
      storeName={activeStore.name}
      storeLogoUrl={activeStore.logoUrl}
      data={dashboardData}
    />
  )
}
