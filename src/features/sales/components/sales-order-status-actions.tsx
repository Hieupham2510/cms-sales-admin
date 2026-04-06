"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { updateSalesOrderStatusAction } from "@/features/sales/actions/update-sales-order-status-action";
import { salesOrderStatusLabel } from "@/features/sales/utils";
import type { SalesOrderStatus } from "@/features/sales/types";

type TargetStatus = "completed" | "failed_delivery" | "cancelled";

const targetStatuses: TargetStatus[] = ["completed", "failed_delivery", "cancelled"];

type Props = {
  orderId: string;
  status: SalesOrderStatus | string;
};

export function SalesOrderStatusActions({ orderId, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [targetStatus, setTargetStatus] = useState<TargetStatus | null>(null);
  const [reason, setReason] = useState("");

  if (status !== "processing") {
    return null;
  }

  function handleConfirm() {
    if (!targetStatus) return;

    startTransition(async () => {
      try {
        await updateSalesOrderStatusAction({
          orderId,
          input: {
            toStatus: targetStatus,
            reason,
          },
        });

        toast.success(`Đã chuyển trạng thái sang ${salesOrderStatusLabel(targetStatus)}`);
        setTargetStatus(null);
        setReason("");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể đổi trạng thái");
      }
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {targetStatuses.map((nextStatus) => (
          <Button
            key={nextStatus}
            type="button"
            variant={nextStatus === "completed" ? "default" : "outline"}
            onClick={() => setTargetStatus(nextStatus)}
          >
            {salesOrderStatusLabel(nextStatus)}
          </Button>
        ))}
      </div>

      <Dialog
        open={Boolean(targetStatus)}
        onOpenChange={(open) => {
          if (!open) {
            setTargetStatus(null);
            setReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận chuyển trạng thái</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            {`Bạn có chắc chắn muốn chuyển đơn sang trạng thái ${salesOrderStatusLabel(targetStatus ?? "")}?`}
          </p>

          <div className="space-y-2">
            <p className="text-sm font-medium">Lý do (tùy chọn)</p>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Nhập lý do chuyển trạng thái"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTargetStatus(null);
                setReason("");
              }}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={isPending}>
              {isPending ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
