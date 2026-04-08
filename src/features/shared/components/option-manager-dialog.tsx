"use client";

import { useEffect, useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { AppRole } from "@/features/auth/types";

type Item = {
  id: string;
  name: string;
};

type Props = {
  role: AppRole;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  items: Item[];
  onItemsChange: (items: Item[]) => void;
  onSelect?: (item: Item) => void;
  listAction?: () => Promise<Item[]>;
  createAction: (input: { name: string }) => Promise<Item>;
  updateAction: (input: { id: string; name: string }) => Promise<Item | null>;
  deleteAction: (input: { id: string }) => Promise<{ success: boolean }>;
};

export function OptionManagerDialog({
  role,
  open,
  onOpenChange,
  title,
  items,
  onItemsChange,
  onSelect,
  listAction,
  createAction,
  updateAction,
  deleteAction,
}: Props) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const entityLabel = title.replace(/^Quản lý\s+/i, "").toLowerCase();

  useEffect(() => {
    if (!open || !listAction) return;

    startTransition(async () => {
      try {
        const latest = await listAction();
        onItemsChange(latest);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Không thể tải dữ liệu");
      }
    });
  }, [open, listAction, onItemsChange]);

  const resetForm = () => {
    setName("");
    setEditingId(null);
    setError("");
  };

  const handleSubmit = () => {
    setError("");

    startTransition(async () => {
      try {
        if (!name.trim()) {
          setError("Vui lòng nhập tên");
          return;
        }

        if (editingId) {
          const updated = await updateAction({
            id: editingId,
            name,
          });

          if (!updated) return;

          const nextItems = items.map((item) =>
            item.id === updated.id ? updated : item,
          );
          onItemsChange(nextItems);
          resetForm();
          toast.success(`Cập nhật ${entityLabel} thành công`);
          return;
        }

        const created = await createAction({ name });

        const nextItems = [...items, created].sort((a, b) =>
          a.name.localeCompare(b.name, "vi"),
        );

        onItemsChange(nextItems);
        onSelect?.(created);
        resetForm();
        toast.success(`Tạo mới ${entityLabel} thành công`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
        setError(message);
        toast.error(message);
      }
    });
  };

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setName(item.name);
    setError("");
  };

  const handleDelete = (item: Item) => {
    startTransition(async () => {
      try {
        await deleteAction({ id: item.id });
        onItemsChange(items.filter((x) => x.id !== item.id));
        toast.success(`Xóa ${entityLabel} thành công`);

        if (editingId === item.id) {
          resetForm();
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Không thể xóa";
        setError(message);
        toast.error(message);
      }
      setDeletingItem(null);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên..."
            />
            <Button type="button" onClick={handleSubmit} disabled={isPending}>
              {editingId ? "Cập nhật" : "Thêm mới"}
            </Button>
            {editingId ? (
              <Button type="button" variant="outline" onClick={resetForm}>
                Hủy
              </Button>
            ) : null}
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          <div className="max-h-[360px] overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Tên
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        {role === "admin" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setDeletingItem(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}

                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            onSelect?.(item);
                            onOpenChange(false);
                          }}
                        >
                          Chọn
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Chưa có dữ liệu.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={Boolean(deletingItem)} onOpenChange={(open) => !open && setDeletingItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-muted-foreground">
              {`Bạn có chắc chắn muốn xóa ${entityLabel} "${deletingItem?.name ?? ""}"?`}
            </p>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDeletingItem(null)}>
                Hủy
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isPending || !deletingItem}
                onClick={() => deletingItem && handleDelete(deletingItem)}
              >
                Xóa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
