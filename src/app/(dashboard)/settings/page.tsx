import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"

export default function SettingsPage() {
  return (
    <div className="section-block">
      <PageHeader title="Cài đặt" description="Thiết lập cấu hình hệ thống bán hàng." />
      <EmptyState
        title="Chưa có cài đặt nâng cao"
        description="Bạn có thể bổ sung phần cấu hình người dùng, phân quyền và tích hợp API tại đây."
      />
    </div>
  )
}
