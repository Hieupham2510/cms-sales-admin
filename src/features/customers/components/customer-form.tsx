"use client";

import { useMemo, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { generateCustomerCode } from "@/lib/helpers";
import {
  customerFormSchema,
  type CustomerFormInput,
  type CustomerFormValues,
} from "@/features/customers/schemas/customer-form-schema";

type Props = {
  mode: "create" | "edit";
  defaultValues?: Partial<CustomerFormInput>;
  submitAction: (
    values: CustomerFormValues,
  ) => Promise<{ id?: string; success?: boolean } | void>;
};

export function CustomerForm({ mode, defaultValues, submitAction }: Props) {
  const [activeTab, setActiveTab] = useState<"general" | "invoice">("general");
  const [isPending, startTransition] = useTransition();
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);
  const router = useRouter();
  const generatedCode = useMemo(
    () => (mode === "create" ? generateCustomerCode() : ""),
    [mode],
  );

  const form = useForm<CustomerFormInput, unknown, CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      code: defaultValues?.code ?? generatedCode,
      name: defaultValues?.name ?? "",
      groupName: defaultValues?.groupName ?? "",
      dateOfBirth: defaultValues?.dateOfBirth ?? "",
      gender: defaultValues?.gender ?? "",
      phone: defaultValues?.phone ?? "",
      email: defaultValues?.email ?? "",
      facebook: defaultValues?.facebook ?? "",
      note: defaultValues?.note ?? "",

      billingCustomerType:
        defaultValues?.billingCustomerType === "business"
          ? "business"
          : "individual",
      billingBuyerName: defaultValues?.billingBuyerName ?? "",
      billingTaxCode: defaultValues?.billingTaxCode ?? "",
      billingNationalId: defaultValues?.billingNationalId ?? "",
      billingPassport: defaultValues?.billingPassport ?? "",
      billingEmail: defaultValues?.billingEmail ?? "",
      billingPhone: defaultValues?.billingPhone ?? "",
      billingBankName: defaultValues?.billingBankName ?? "",
      billingBankAccount: defaultValues?.billingBankAccount ?? "",
      billingAddressLine: defaultValues?.billingAddressLine ?? "",
      billingArea: defaultValues?.billingArea ?? "",
      billingWard: defaultValues?.billingWard ?? "",
      addresses:
        defaultValues?.addresses && defaultValues.addresses.length > 0
          ? defaultValues.addresses
          : [
              {
                label: "Mặc định",
                line1: "",
                area: "",
                ward: "",
                isDefault: true,
              },
            ],
    },
  });

  const addressesField = useFieldArray({
    control: form.control,
    name: "addresses",
  });
  const gender = useWatch({
    control: form.control,
    name: "gender",
  });
  const billingCustomerType = useWatch({
    control: form.control,
    name: "billingCustomerType",
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const result = await submitAction(values);

        if (mode === "create") {
          if (result?.id) {
            router.push(`/customers/${result.id}?created=1`);
          }
          return;
        }

        toast.success("Cập nhật khách hàng thành công");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
      }
    });
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "create" ? "Thêm khách hàng" : "Chi tiết khách hàng"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý thông tin khách hàng và thông tin xuất hóa đơn.
          </p>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>

      <Tabs
        defaultValue="general"
        onValueChange={(value) =>
          setActiveTab((value as "general" | "invoice") ?? "general")
        }
        className="w-full flex-col gap-0"
      >
        <div className="border-b">
          <TabsList
            variant="line"
            className="relative h-auto gap-0 rounded-none bg-transparent p-0"
          >
            <span
              className="absolute bottom-[-1px] left-0 z-0 h-0.5 w-1/2 bg-primary transition-transform duration-300 ease-out"
              style={{
                transform:
                  activeTab === "general"
                    ? "translateX(0%)"
                    : "translateX(100%)",
              }}
            />
            <TabsTrigger
              value="general"
              className="relative z-10 rounded-none border border-transparent px-8 pb-3 pt-0 text-[15px] font-medium text-muted-foreground shadow-none transition-colors duration-200 data-active:border-transparent data-active:bg-transparent data-active:text-primary"
            >
              Thông tin chung
            </TabsTrigger>
            <TabsTrigger
              value="invoice"
              className="relative z-10 rounded-none border border-transparent px-8 pb-3 pt-0 text-[15px] font-medium text-muted-foreground shadow-none transition-colors duration-200 data-active:border-transparent data-active:bg-transparent data-active:text-primary"
            >
              Thông tin xuất hóa đơn
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="mt-4 outline-none">
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mã khách hàng</Label>
                  <Input {...form.register("code")} />
                </div>
                <div className="space-y-2">
                  <Label>Nhóm</Label>
                  <Input placeholder="Nhóm khách hàng" {...form.register("groupName")} />
                </div>
                <div className="space-y-2">
                  <Label>Tên khách hàng</Label>
                  <Input placeholder="Bắt buộc" {...form.register("name")} />
                </div>
                <div className="space-y-2">
                  <Label>Ngày sinh</Label>
                  <Input type="date" {...form.register("dateOfBirth")} />
                </div>
                <div className="space-y-2">
                  <Label>Điện thoại</Label>
                  <Input {...form.register("phone")} />
                </div>
                <div className="space-y-2">
                  <Label>Giới tính</Label>
                  <div className="flex items-center gap-3">
                    <label
                      className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm transition-colors ${
                        gender === "male"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input bg-background hover:bg-muted/40"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={gender === "male"}
                        onChange={() => form.setValue("gender", "male")}
                      />
                      Nam
                    </label>
                    <label
                      className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm transition-colors ${
                        gender === "female"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input bg-background hover:bg-muted/40"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={gender === "female"}
                        onChange={() => form.setValue("gender", "female")}
                      />
                      Nữ
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input {...form.register("email")} />
                </div>
                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input {...form.register("facebook")} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Ghi chú</Label>
                  <Textarea rows={3} {...form.register("note")} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">Địa chỉ</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    addressesField.append({
                      label: "",
                      line1: "",
                      area: "",
                      ward: "",
                      isDefault: addressesField.fields.length === 0,
                    })
                  }
                >
                  Thêm địa chỉ
                </Button>
              </div>

              <div className="space-y-3">
                {addressesField.fields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-medium">
                        {String(form.getValues(`addresses.${index}.label`) || `Địa chỉ ${index + 1}`)}
                      </h4>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => setRemoveIndex(index)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nhãn</Label>
                        <Input {...form.register(`addresses.${index}.label`)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Địa chỉ chi tiết</Label>
                        <Input {...form.register(`addresses.${index}.line1`)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Khu vực</Label>
                        <Input {...form.register(`addresses.${index}.area`)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Phường/Xã</Label>
                        <Input {...form.register(`addresses.${index}.ward`)} />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(form.getValues(`addresses.${index}.isDefault`))}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            if (!checked) {
                              form.setValue(`addresses.${index}.isDefault`, false);
                              return;
                            }
                            addressesField.fields.forEach((_, itemIndex) => {
                              form.setValue(`addresses.${itemIndex}.isDefault`, itemIndex === index);
                            });
                          }}
                        />
                        <span className="text-sm">Địa chỉ mặc định</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invoice" className="mt-4 outline-none">
          <div className="rounded-xl border bg-card p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                <Label>Loại khách hàng</Label>
                <div className="flex items-center gap-3">
                  <label
                    className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm transition-colors ${
                      billingCustomerType === "individual"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input bg-background hover:bg-muted/40"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={billingCustomerType === "individual"}
                      onChange={() => form.setValue("billingCustomerType", "individual")}
                    />
                    Cá nhân
                  </label>
                  <label
                    className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm transition-colors ${
                      billingCustomerType === "business"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input bg-background hover:bg-muted/40"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={billingCustomerType === "business"}
                      onChange={() => form.setValue("billingCustomerType", "business")}
                    />
                    Tổ chức / Hộ kinh doanh
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tên người mua</Label>
                <Input {...form.register("billingBuyerName")} />
              </div>
              <div className="space-y-2">
                <Label>Số CMND/CCCD</Label>
                <Input {...form.register("billingNationalId")} />
              </div>
              <div className="space-y-2">
                <Label>Mã số thuế</Label>
                <Input {...form.register("billingTaxCode")} />
              </div>
              <div className="space-y-2">
                <Label>Số hộ chiếu</Label>
                <Input {...form.register("billingPassport")} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input {...form.register("billingEmail")} />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input {...form.register("billingPhone")} />
              </div>
              <div className="space-y-2">
                <Label>Tên ngân hàng</Label>
                <Input {...form.register("billingBankName")} />
              </div>
              <div className="space-y-2">
                <Label>STK ngân hàng</Label>
                <Input {...form.register("billingBankAccount")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Địa chỉ</Label>
                <Input {...form.register("billingAddressLine")} />
              </div>
              <div className="space-y-2">
                <Label>Tỉnh/Thành phố</Label>
                <Input {...form.register("billingArea")} />
              </div>
              <div className="space-y-2">
                <Label>Phường/Xã</Label>
                <Input {...form.register("billingWard")} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={removeIndex !== null} onOpenChange={(open) => !open && setRemoveIndex(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa địa chỉ</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa địa chỉ này?
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setRemoveIndex(null)}>
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (removeIndex === null) return;
                addressesField.remove(removeIndex);
                setRemoveIndex(null);
              }}
            >
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
