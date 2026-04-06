"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { switchActiveStoreAction } from "@/features/auth/actions/switch-active-store-action";
import type { AuthStore } from "@/features/auth/types";

type Props = {
  activeStoreId: string | null;
  stores: AuthStore[];
};

export function StoreSwitcher({ activeStoreId, stores }: Props) {
  const [isPending, startTransition] = useTransition();
  const effectiveStoreId = activeStoreId ?? stores[0]?.id ?? null;
  const effectiveStoreName =
    stores.find((store) => store.id === effectiveStoreId)?.name ?? "Chọn cửa hàng";

  if (stores.length === 0) {
    return null;
  }

  return (
    <Select
      value={effectiveStoreId}
      onValueChange={(value) => {
        if (!value) return;

        startTransition(async () => {
          try {
            await switchActiveStoreAction(value);
            toast.success("Đã chuyển cửa hàng");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể chuyển cửa hàng");
          }
        });
      }}
      disabled={isPending}
    >
      <SelectTrigger className="w-[220px]">
        <SelectValue>{effectiveStoreName}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {stores.map((store) => (
          <SelectItem key={store.id} value={store.id}>
            {store.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
