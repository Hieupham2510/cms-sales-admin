import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsLoading() {
  return (
    <div className="section-block">
      <Skeleton className="h-9 w-56" />
      <div className="table-shell p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="mt-2 h-10 w-full" />
        <Skeleton className="mt-2 h-10 w-2/3" />
      </div>
    </div>
  )
}
