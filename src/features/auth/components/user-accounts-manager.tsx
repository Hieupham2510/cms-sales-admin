"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUserAccountAction } from "@/features/auth/actions/create-user-account-action";
import type { AppRole } from "@/features/auth/types";

type UserAccountRow = {
  id: string;
  username: string;
  fullName: string | null;
  email: string;
  role: string;
  updatedAt: Date;
  stores: Array<{ storeId: string; storeName: string; isDefault: boolean }>;
};

type StoreOption = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  actorRole: AppRole;
  currentStoreId: string | null;
  accounts: UserAccountRow[];
  stores: StoreOption[];
};

function roleLabel(role: string) {
  if (role === "admin") return "Admin";
  if (role === "manager") return "Quản lý";
  return "Nhân viên";
}

function roleBadgeClass(role: string) {
  if (role === "admin") return "status-badge-warning";
  if (role === "manager") return "status-badge-success";
  return "bg-muted text-muted-foreground";
}

export function UserAccountsManager({ actorRole, currentStoreId, accounts, stores }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"manager" | "staff">(actorRole === "admin" ? "manager" : "staff");
  const [storeId, setStoreId] = useState(currentStoreId ?? stores[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  const roleOptions = useMemo(
    () =>
      actorRole === "admin"
        ? [
            { value: "manager", label: "Quản lý" },
            { value: "staff", label: "Nhân viên" },
          ]
        : [{ value: "staff", label: "Nhân viên" }],
    [actorRole],
  );
  const selectedRoleLabel =
    roleOptions.find((option) => option.value === role)?.label ?? "Chọn vai trò";
  const selectedStoreLabel =
    stores.find((store) => store.id === storeId)?.name ?? "Chọn cửa hàng";

  if (actorRole === "staff") {
    return null;
  }

  function resetForm() {
    setUsername("");
    setFullName("");
    setPassword("");
    setRole(actorRole === "admin" ? "manager" : "staff");
    setStoreId(currentStoreId ?? stores[0]?.id ?? "");
  }

  function handleSubmit() {
    if (!username || !password || !storeId) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    startTransition(async () => {
      try {
        await createUserAccountAction({
          username,
          password,
          fullName,
          role,
          storeId,
        });
        toast.success("Tạo tài khoản thành công");
        setOpen(false);
        resetForm();
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể tạo tài khoản");
      }
    });
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Tài khoản & phân quyền</h2>
          <p className="text-sm text-muted-foreground">
            Admin tạo tài khoản quản lý/nhân viên, quản lý chỉ tạo tài khoản nhân viên.
          </p>
        </div>
        <Button type="button" onClick={() => setOpen(true)}>
          Tạo tài khoản
        </Button>
      </div>

      <div className="table-shell">
        <div className="table-content">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b">
                <th className="h-11 px-4 text-left font-medium text-muted-foreground">
                  Tên đăng nhập
                </th>
                <th className="h-11 px-4 text-left font-medium text-muted-foreground">
                  Họ tên
                </th>
                <th className="h-11 px-4 text-left font-medium text-muted-foreground">Vai trò</th>
                <th className="h-11 px-4 text-left font-medium text-muted-foreground">
                  Cửa hàng
                </th>
                <th className="h-11 px-4 text-left font-medium text-muted-foreground">
                  Cập nhật
                </th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.username}</div>
                    <div className="text-xs text-muted-foreground">{item.email}</div>
                  </td>
                  <td className="px-4 py-3">{item.fullName ?? "-"}</td>
                  <td className="px-4 py-3">
                    <Badge className={roleBadgeClass(item.role)}>{roleLabel(item.role)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {item.stores.length === 0 ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      <div className="space-y-1">
                        {item.stores.map((store) => (
                          <div key={store.storeId} className="text-sm">
                            {store.storeName}
                            {store.isDefault ? (
                              <span className="ml-2 text-xs text-muted-foreground">(Mặc định)</span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Intl.DateTimeFormat("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(item.updatedAt))}
                  </td>
                </tr>
              ))}

              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-24 text-center text-muted-foreground">
                    Chưa có tài khoản phù hợp phạm vi quản lý.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo tài khoản</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-username">Tên đăng nhập</Label>
              <Input
                id="create-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Nhập tên đăng nhập"
                autoComplete="off"
                name="create-account-username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-full-name">Họ tên</Label>
              <Input
                id="create-full-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Nhập họ tên (tùy chọn)"
                autoComplete="off"
                name="create-account-full-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-password">Mật khẩu</Label>
              <Input
                id="create-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Nhập mật khẩu"
                autoComplete="new-password"
                name="create-account-password"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Vai trò</Label>
                <Select
                  value={role}
                  onValueChange={(value) => {
                    if (!value) return;
                    setRole(value as "manager" | "staff");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue>{selectedRoleLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cửa hàng</Label>
                <Select
                  value={storeId}
                  onValueChange={(value) => {
                    if (!value) return;
                    setStoreId(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue>{selectedStoreLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              {isPending ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
