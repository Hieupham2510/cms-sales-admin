import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"

export default function InventoryImportsPage() {
  return (
    <div className="section-block">
      <PageHeader title="Nhập kho" description="Theo dõi các phiếu nhập hàng vào kho." actionLabel="Tạo phiếu nhập" />
      <EmptyState
        title="Chưa có phiếu nhập"
        description="Khi tạo phiếu nhập mới, dữ liệu sẽ hiển thị ở đây để bạn theo dõi trạng thái duyệt."
      />
    </div>
  )
}
