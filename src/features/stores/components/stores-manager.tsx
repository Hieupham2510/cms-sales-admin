"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/shared/table-pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStoreAction } from "@/features/stores/actions/create-store-action";
import { TABLE_PAGE_SIZE } from "@/lib/constants";

type StoreRow = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

type Props = {
  stores: StoreRow[];
};

export function StoresManager({ stores }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(stores.length / TABLE_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageStores = useMemo(() => {
    const start = (currentPage - 1) * TABLE_PAGE_SIZE;
    return stores.slice(start, start + TABLE_PAGE_SIZE);
  }, [stores, currentPage]);

  function resetForm() {
    setName("");
    setSlug("");
    setLogoFile(null);
  }

  function handleCreate() {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên cửa hàng");
      return;
    }

    startTransition(async () => {
      try {
        await createStoreAction({
          name,
          slug,
          logoFile,
        });
        toast.success("Tạo cửa hàng thành công");
        setOpen(false);
        resetForm();
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể tạo cửa hàng");
      }
    });
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Cửa hàng</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý danh sách cửa hàng và logo riêng theo từng cửa hàng.
          </p>
        </div>
        <Button type="button" onClick={() => setOpen(true)}>
          Thêm cửa hàng
        </Button>
      </div>

      <div className="table-shell">
        <div className="table-content">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b">
                <th className="h-11 px-4 text-left font-medium text-muted-foreground">Logo</th>
                <th className="h-11 px-4 text-left font-medium text-muted-foreground">Tên cửa hàng</th>
                <th className="h-11 px-4 text-left font-medium text-muted-foreground">Slug</th>
              </tr>
            </thead>
            <tbody>
              {pageStores.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="px-4 py-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.logoUrl || "/logo.png"}
                        alt={`Logo ${item.name}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.slug}</td>
                </tr>
              ))}
              {pageStores.length === 0 ? (
                <tr>
                  <td colSpan={3} className="h-20 text-center text-muted-foreground">
                    Chưa có cửa hàng.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={currentPage}
          totalItems={stores.length}
          pageSize={TABLE_PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo cửa hàng</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Tên cửa hàng</Label>
              <Input
                id="store-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nhập tên cửa hàng"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-slug">Slug (tùy chọn)</Label>
              <Input
                id="store-slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="Vi du: chi-nhanh-trung-tam"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-logo">Logo cửa hàng (tùy chọn)</Label>
              <Input
                id="store-logo"
                type="file"
                accept="image/*"
                onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="button" onClick={handleCreate} disabled={isPending}>
              {isPending ? "Đang tạo..." : "Tạo cửa hàng"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
