"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateProductSku } from "@/lib/helpers";
import {
  productFormSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "@/features/products/schemas/product-form-schema";
import ProductDescriptionTab from "./product-description-tab";
import ProductInformationTab from "./product-information-tab";

type Option = {
  id: string;
  name: string;
};

type ImagePayload = {
  file?: File;
  imageUrl?: string;
  isPrimary?: boolean;
  sortOrder?: number;
};

type Props = {
  mode: "create" | "edit";
  defaultValues?: Partial<ProductFormInput>;
  categories?: Option[];
  brands?: Option[];
  locations?: Option[];
  submitAction: (
    values: ProductFormValues,
  ) => Promise<{ id?: string; success?: boolean } | void>;
};

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploads/product-image", {
    method: "POST",
    body: formData,
  });

  const json = await response.json();

  if (!response.ok || !json?.publicUrl) {
    throw new Error(json?.error ?? "Upload ảnh thất bại");
  }

  return json.publicUrl as string;
}

export function ProductForm({
  mode,
  defaultValues,
  categories = [],
  brands = [],
  locations = [],
  submitAction,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"information" | "description">(
    "information",
  );
  const generatedSku = useMemo(
    () => (mode === "create" ? generateProductSku() : ""),
    [mode],
  );

  const form = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      sku: defaultValues?.sku ?? generatedSku,
      barcode: defaultValues?.barcode ?? "",
      name: defaultValues?.name ?? "",
      categoryId: defaultValues?.categoryId ?? "",
      brandId: defaultValues?.brandId ?? "",
      locationId: defaultValues?.locationId ?? "",
      costPrice: defaultValues?.costPrice ?? "0",
      salePrice: defaultValues?.salePrice ?? "0",
      currentStock: defaultValues?.currentStock,
      minStockAlert: defaultValues?.minStockAlert,
      maxStockAlert: defaultValues?.maxStockAlert,
      weightValue: defaultValues?.weightValue ?? "0",
      weightUnit: defaultValues?.weightUnit ?? "g",
      description: defaultValues?.description ?? "",
      orderNote: defaultValues?.orderNote ?? "",
      status: defaultValues?.status ?? "active",
      images: defaultValues?.images ?? [],
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const normalizedImages: ImagePayload[] = [];

        for (let i = 0; i < (values.images ?? []).length; i++) {
          const item = values.images[i];

          if (item.file instanceof File) {
            const publicUrl = await uploadImage(item.file);
            normalizedImages.push({
              imageUrl: publicUrl,
              isPrimary: item.isPrimary ?? i === 0,
              sortOrder: item.sortOrder ?? i,
            });
            continue;
          }

          if (item.imageUrl && !item.imageUrl.startsWith("blob:")) {
            normalizedImages.push({
              imageUrl: item.imageUrl,
              isPrimary: item.isPrimary ?? i === 0,
              sortOrder: item.sortOrder ?? i,
            });
          }
        }

        const result = await submitAction({
          ...values,
          images: normalizedImages,
        });

        if (mode === "create") {
          toast.success("Tạo hàng hóa thành công");

          if (result?.id) {
            router.push(`/products/${result.id}`);
          }
          return;
        }

        toast.success("Cập nhật hàng hóa thành công");
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
            {mode === "create" ? "Thêm hàng hóa" : "Chi tiết hàng hóa"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "create"
              ? "Tạo mới sản phẩm và thiết lập thông tin bán hàng."
              : "Cập nhật thông tin sản phẩm."}
          </p>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Đang lưu..."
            : mode === "create"
              ? "Lưu hàng hóa"
              : "Cập nhật"}
        </Button>
      </div>

      <Tabs
        defaultValue="information"
        onValueChange={(value) =>
          setActiveTab((value as "information" | "description") ?? "information")
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
                  activeTab === "information"
                    ? "translateX(0%)"
                    : "translateX(100%)",
              }}
            />
            <TabsTrigger
              value="information"
              className="relative z-10 rounded-none border border-transparent px-8 pb-3 pt-0 text-[15px] font-medium text-muted-foreground shadow-none transition-colors duration-200 data-active:border-transparent data-active:bg-transparent data-active:text-primary"
            >
              Thông tin
            </TabsTrigger>

            <TabsTrigger
              value="description"
              className="relative z-10 rounded-none border border-transparent px-8 pb-3 pt-0 text-[15px] font-medium text-muted-foreground shadow-none transition-colors duration-200 data-active:border-transparent data-active:bg-transparent data-active:text-primary"
            >
              Mô tả
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="information" className="mt-4 outline-none">
          <ProductInformationTab
            form={form}
            categories={categories}
            brands={brands}
            locations={locations}
          />
        </TabsContent>

        <TabsContent value="description" className="mt-4 outline-none">
          <ProductDescriptionTab form={form} />
        </TabsContent>
      </Tabs>
    </form>
  );
}
