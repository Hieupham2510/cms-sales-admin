"use client";

import { useEffect, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createCustomerAction } from "@/features/customers/actions/create-customer-action";
import {
  customerFormSchema,
  type CustomerFormInput,
  type CustomerFormValues,
} from "@/features/customers/schemas/customer-form-schema";
import { generateCustomerCode } from "@/lib/helpers";

type CustomerLite = {
  id: string;
  code: string;
  name: string;
  phone: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onCreated: (customer: CustomerLite) => void;
};

function createDefaultValues(): CustomerFormInput {
  return {
    code: generateCustomerCode(),
    name: "",
    groupName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    facebook: "",
    note: "",
    billingCustomerType: "individual",
    billingBuyerName: "",
    billingTaxCode: "",
    billingNationalId: "",
    billingPassport: "",
    billingEmail: "",
    billingPhone: "",
    billingBankName: "",
    billingBankAccount: "",
    billingAddressLine: "",
    billingArea: "",
    billingWard: "",
    addresses: [],
  };
}

export function SalesCustomerQuickCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CustomerFormInput, unknown, CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: createDefaultValues(),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(createDefaultValues());
  }, [open, form]);

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const result = await createCustomerAction(values);
        onCreated({
          id: result.id ?? "",
          code: values.code,
          name: values.name,
          phone: values.phone ?? null,
        });
        toast.success("Tạo khách hàng thành công");
        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể tạo khách hàng");
      }
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] !w-[min(1080px,96vw)] !max-w-[min(1080px,96vw)] overflow-y-auto p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>Thêm khách hàng</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <Tabs defaultValue="general" className="w-full">
            <TabsList variant="line" className="h-auto bg-transparent p-0">
              <TabsTrigger value="general" className="px-4 py-2">
                Thông tin chung
              </TabsTrigger>
              <TabsTrigger value="invoice" className="px-4 py-2">
                Thông tin xuất hóa đơn
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mã khách hàng</Label>
                  <Input {...form.register("code")} />
                </div>
                <div className="space-y-2">
                  <Label>Nhóm</Label>
                  <Input {...form.register("groupName")} />
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
                  <Label>Email</Label>
                  <Input {...form.register("email")} />
                </div>
                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input {...form.register("facebook")} />
                </div>
                <div className="space-y-2">
                  <Label>Giới tính</Label>
                  <Input placeholder="Nam / Nữ" {...form.register("gender")} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Ghi chú</Label>
                  <Textarea rows={3} {...form.register("note")} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="invoice" className="mt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tên người mua</Label>
                  <Input {...form.register("billingBuyerName")} />
                </div>
                <div className="space-y-2">
                  <Label>Mã số thuế</Label>
                  <Input {...form.register("billingTaxCode")} />
                </div>
                <div className="space-y-2">
                  <Label>Số CMND/CCCD</Label>
                  <Input {...form.register("billingNationalId")} />
                </div>
                <div className="space-y-2">
                  <Label>Email xuất hóa đơn</Label>
                  <Input {...form.register("billingEmail")} />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input {...form.register("billingPhone")} />
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ</Label>
                  <Input {...form.register("billingAddressLine")} />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Bỏ qua
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
