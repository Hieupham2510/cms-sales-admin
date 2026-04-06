import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { UserAccountsManager } from "@/features/auth/components/user-accounts-manager"
import { getAuthContext } from "@/features/auth/queries/get-auth-context"
import { getManageableStores } from "@/features/auth/queries/get-manageable-stores"
import { getUserAccounts } from "@/features/auth/queries/get-user-accounts"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const auth = await getAuthContext()
  if (!auth) {
    redirect("/login")
  }

  if (auth.role === "staff") {
    return (
      <div className="section-block space-y-6">
        <PageHeader title="Cài đặt" description="Thiết lập cấu hình hệ thống bán hàng." />
        <EmptyState
          title="Bạn không có quyền truy cập mục này"
          description="Tài khoản nhân viên không được phép quản lý người dùng và phân quyền."
        />
      </div>
    )
  }

  let accounts: Awaited<ReturnType<typeof getUserAccounts>> = []
  let stores: Awaited<ReturnType<typeof getManageableStores>> = []
  let loadError: string | null = null

  try {
    accounts = await getUserAccounts(auth)
    stores = await getManageableStores(auth)
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Vui lòng thử lại sau."
  }

  if (loadError) {
    return (
      <div className="section-block space-y-6">
        <PageHeader title="Cài đặt" description="Thiết lập cấu hình hệ thống bán hàng." />
        <EmptyState
          title="Không thể tải dữ liệu cài đặt"
          description={loadError}
        />
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="section-block space-y-6">
        <PageHeader title="Cài đặt" description="Thiết lập cấu hình hệ thống bán hàng." />
        <EmptyState
          title="Tài khoản chưa được gán cửa hàng"
          description="Hãy gán cửa hàng cho tài khoản quản lý trước khi sử dụng trang cài đặt."
        />
      </div>
    )
  }

  return (
    <div className="section-block space-y-6">
      <PageHeader title="Cài đặt" description="Thiết lập cấu hình hệ thống bán hàng." />
      <UserAccountsManager
        actorRole={auth.role}
        currentStoreId={auth.activeStoreId}
        stores={stores}
        accounts={accounts}
      />
    </div>
  )
}
