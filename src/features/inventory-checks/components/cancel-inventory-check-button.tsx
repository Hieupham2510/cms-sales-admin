"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cancelInventoryCheckAction } from "@/features/inventory-checks/actions/cancel-inventory-check-action";

type Props = {
  checkId: string;
  canCancel: boolean;
  size?: "sm" | "default";
  className?: string;
};

export default function CancelInventoryCheckButton({
  checkId,
  canCancel,
  size = "sm",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        await cancelInventoryCheckAction(checkId);
        toast.success("Hủy phiếu kiểm kho thành công");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể hủy phiếu");
      }
    });
  };

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <Button
        type="button"
        variant="outline"
        size={size}
        className={className}
        disabled={!canCancel}
        title={
          canCancel ? "Hủy phiếu" : "Chỉ hủy được phiếu mới nhất của sản phẩm"
        }
        onClick={() => setOpen(true)}
      >
        Hủy
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận hủy phiếu kiểm kho</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Hành động này sẽ xóa phiếu kiểm kho và hoàn tác tồn kho về số trước đó.
          </p>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Không
            </Button>
            <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isPending}>
              {isPending ? "Đang xử lý..." : "Xác nhận hủy"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
