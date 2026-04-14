"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/shared/table-pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStoreAction } from "@/features/stores/actions/create-store-action";
import { updateStoreAction } from "@/features/stores/actions/update-store-action";
import { deleteStoreAction } from "@/features/stores/actions/delete-store-action";
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
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [storePendingDelete, setStorePendingDelete] = useState<StoreRow | null>(null);
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
    setEditingStoreId(null);
    setMode("create");
  }

  function handleOpenCreate() {
    resetForm();
    setOpen(true);
  }

  function handleOpenEdit(store: StoreRow) {
    setMode("edit");
    setEditingStoreId(store.id);
    setName(store.name);
    setSlug(store.slug);
    setLogoFile(null);
    setOpen(true);
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên cửa hàng");
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createStoreAction({
            name,
            slug,
            logoFile,
          });
          toast.success("Tạo cửa hàng thành công");
        } else {
          if (!editingStoreId) {
            toast.error("Không xác định được cửa hàng cần sửa");
            return;
          }
          await updateStoreAction({
            id: editingStoreId,
            name,
            slug,
            logoFile,
          });
          toast.success("Cập nhật cửa hàng thành công");
        }
        setOpen(false);
        resetForm();
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : mode === "create"
              ? "Không thể tạo cửa hàng"
              : "Không thể cập nhật cửa hàng",
        );
      }
    });
  }

  function handleDeleteStore() {
    if (!storePendingDelete) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteStoreAction({ id: storePendingDelete.id });
        toast.success("Xóa cửa hàng thành công");
        setStorePendingDelete(null);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể xóa cửa hàng");
      }
    });
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Cửa hàng</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý danh sách cửa hàng, cập nhật thông tin và logo riêng theo từng cửa hàng.
          </p>
        </div>
        <Button type="button" onClick={handleOpenCreate}>
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
                <th className="h-11 px-4 text-right font-medium text-muted-foreground">Thao tác</th>
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
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(item)}
                        aria-label={`Sửa cửa hàng ${item.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setStorePendingDelete(item)}
                        aria-label={`Xóa cửa hàng ${item.name}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {pageStores.length === 0 ? (
                <tr>
                  <td colSpan={4} className="h-20 text-center text-muted-foreground">
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
            <DialogTitle>{mode === "create" ? "Tạo cửa hàng" : "Sửa cửa hàng"}</DialogTitle>
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
            <Button type="button" onClick={handleSubmit} disabled={isPending}>
              {isPending
                ? mode === "create"
                  ? "Đang tạo..."
                  : "Đang lưu..."
                : mode === "create"
                  ? "Tạo cửa hàng"
                  : "Lưu thay đổi"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(storePendingDelete)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setStorePendingDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa cửa hàng</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn có chắc muốn xóa cửa hàng <span className="font-medium text-foreground">{storePendingDelete?.name}</span>?
            Dữ liệu liên quan của cửa hàng sẽ bị xóa theo.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStorePendingDelete(null)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteStore}
              disabled={isPending}
            >
              {isPending ? "Đang xóa..." : "Xóa cửa hàng"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
