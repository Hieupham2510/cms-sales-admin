"use client";

import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
};

export function TablePagination({
  page,
  totalItems,
  pageSize = 20,
  onPageChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = totalItems === 0 ? 0 : Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col items-center justify-between gap-2 border-t px-4 py-3 text-sm text-muted-foreground md:flex-row">
      <p>
        Hiển thị {from}-{to} / {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Trước
        </Button>
        <span className="min-w-16 text-center text-foreground">
          {page}/{totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}
