import { LoadingOverlay } from "@/components/shared/loading-overlay";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="section-block relative min-h-[60vh] space-y-6">
      <LoadingOverlay label="Đang chuyển trang..." />

      <div className="page-header">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </div>
      </div>
    </div>
  );
}
