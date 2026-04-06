import { SalesDashboard } from "@/components/dashboard/sales-dashboard"
import { getAuthContext } from "@/features/auth/queries/get-auth-context"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const auth = await getAuthContext()
  if (!auth) {
    redirect("/login")
  }

  if (auth.role === "staff") {
    redirect("/staff-home")
  }

  return <SalesDashboard />
}
