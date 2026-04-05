"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ProductFormInput,
  ProductFormValues,
} from "@/features/products/schemas/product-form-schema";
import { ProductImageUploader } from "./product-image-uploader";

import { OptionManagerDialog } from "@/features/shared/components/option-manager-dialog";
import {
  createCategoryAction,
  deleteCategoryAction,
  listCategoriesAction,
  updateCategoryAction,
} from "@/features/categories/actions/category-actions";
import {
  createBrandAction,
  deleteBrandAction,
  listBrandsAction,
  updateBrandAction,
} from "@/features/brands/actions/brand-actions";
import {
  listLocationsAction,
  createLocationAction,
  updateLocationAction,
  deleteLocationAction,
} from "@/features/locations/actions/location-actions";

type Option = {
  id: string;
  name: string;
};

type Props = {
  form: UseFormReturn<ProductFormInput, unknown, ProductFormValues>;
  categories: Option[];
  brands: Option[];
  locations: Option[];
};

function toDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatNumberInput(value: string) {
  const digits = toDigits(value);
  if (!digits) return "";

  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(Number(digits));
}

function formatVndInput(value: string) {
  return formatNumberInput(value);
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-start justify-between px-4 py-4">
        <div>
          <h3 className="text-[18px] font-semibold">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <ChevronUp className="mt-1 h-4 w-4 text-muted-foreground" />
      </div>

      <div className="px-4 pb-4">{children}</div>
    </div>
  );
}

export default function ProductInformationTab({
  form,
  categories,
  brands,
  locations,
}: Props) {
  const { register, setValue, watch } = form;
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState<Option[]>(categories);
  const [brandOptions, setBrandOptions] = useState<Option[]>(brands);
  const [locationOptions, setLocationOptions] = useState<Option[]>(locations);

  const categoryId = watch("categoryId") || "";
  const brandId = watch("brandId") || "";
  const locationId = watch("locationId") || "";
  const currentStock = watch("currentStock");
  const minStockAlert = watch("minStockAlert");
  const maxStockAlert = watch("maxStockAlert");

  const selectedCategoryName = categoryOptions.find(
    (item) => item.id === categoryId,
  )?.name;
  const selectedBrandName = brandOptions.find(
    (item) => item.id === brandId,
  )?.name;
  const selectedLocationName = locationOptions.find(
    (item) => item.id === locationId,
  )?.name;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr_230px]">
          <div className="space-y-5 xl:col-span-2">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Mã hàng</Label>
                <Input placeholder="Tự động" {...register("sku")} />
              </div>

              <div className="space-y-2">
                <Label>Mã vạch</Label>
                <Input placeholder="Nhập mã vạch" {...register("barcode")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tên hàng</Label>
              <Input placeholder="Bắt buộc" {...register("name")} />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Nhóm hàng</Label>
                  <button
                    type="button"
                    className="text-sm font-medium text-primary hover:underline"
                    onClick={() => setIsCategoryDialogOpen(true)}
                  >
                    Tạo mới
                  </button>
                </div>

                <Select
                  value={categoryId}
                  onValueChange={(value) => setValue("categoryId", value || "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhóm hàng (Bắt buộc)">
                      {selectedCategoryName}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Thương hiệu</Label>
                  <button
                    type="button"
                    className="text-sm font-medium text-primary hover:underline"
                    onClick={() => setIsBrandDialogOpen(true)}
                  >
                    Tạo mới
                  </button>
                </div>

                <Select
                  value={brandId}
                  onValueChange={(value) => setValue("brandId", value || "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thương hiệu">
                      {selectedBrandName}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {brandOptions.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <ProductImageUploader
            value={watch("images") || []}
            onChange={(items) => setValue("images", items)}
          />
        </div>
      </div>

      <SectionCard title="Giá vốn, giá bán">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_260px_1fr]">
          <div className="space-y-2">
            <Label>Giá vốn</Label>
            <div className="grid grid-cols-[1fr_auto]">
              <Input
                value={formatVndInput(watch("costPrice") || "")}
                onChange={(event) =>
                  setValue("costPrice", toDigits(event.target.value), {
                    shouldDirty: true,
                  })
                }
                placeholder="0"
                className="rounded-r-none border-r-0 text-right"
                inputMode="numeric"
              />
              <div className="inline-flex items-center rounded-r-lg border border-input bg-muted px-3 text-sm text-muted-foreground">
                VND
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Giá bán</Label>
            <div className="grid grid-cols-[1fr_auto]">
              <Input
                value={formatVndInput(watch("salePrice") || "")}
                onChange={(event) =>
                  setValue("salePrice", toDigits(event.target.value), {
                    shouldDirty: true,
                  })
                }
                placeholder="0"
                className="rounded-r-none border-r-0 text-right"
                inputMode="numeric"
              />
              <div className="inline-flex items-center rounded-r-lg border border-input bg-muted px-3 text-sm text-muted-foreground">
                VND
              </div>
            </div>
          </div>

          {/* <div className="flex items-end">
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
            >
              Thiết lập giá
            </button>
          </div> */}
        </div>
      </SectionCard>

      <SectionCard
        title="Tồn kho"
        description="Quản lý số lượng tồn kho và định mức tồn. Khi tồn kho chạm đến định mức, bạn sẽ nhận được cảnh báo."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Tồn kho</Label>
            <Input
              value={
                currentStock === undefined
                  ? ""
                  : formatNumberInput(String(currentStock))
              }
              onChange={(event) =>
                setValue(
                  "currentStock",
                  toDigits(event.target.value)
                    ? Number(toDigits(event.target.value))
                    : undefined,
                  {
                    shouldDirty: true,
                  },
                )
              }
              placeholder="0"
              className="text-right"
              inputMode="numeric"
            />
          </div>

          <div className="space-y-2">
            <Label>Định mức tồn thấp nhất</Label>
            <Input
              value={
                minStockAlert === undefined
                  ? ""
                  : formatNumberInput(String(minStockAlert))
              }
              onChange={(event) =>
                setValue(
                  "minStockAlert",
                  toDigits(event.target.value)
                    ? Number(toDigits(event.target.value))
                    : undefined,
                  {
                    shouldDirty: true,
                  },
                )
              }
              placeholder="0"
              className="text-right"
              inputMode="numeric"
            />
          </div>

          <div className="space-y-2">
            <Label>Định mức tồn cao nhất</Label>
            <Input
              value={
                maxStockAlert === undefined
                  ? ""
                  : formatNumberInput(String(maxStockAlert))
              }
              onChange={(event) =>
                setValue(
                  "maxStockAlert",
                  toDigits(event.target.value)
                    ? Number(toDigits(event.target.value))
                    : undefined,
                  {
                    shouldDirty: true,
                  },
                )
              }
              placeholder="0"
              className="text-right"
              inputMode="numeric"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Vị trí, trọng lượng"
        description="Quản lý việc sắp xếp kho, vị trí bán hàng hoặc trọng lượng hàng hóa"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Vị trí</Label>
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline"
                onClick={() => setIsLocationDialogOpen(true)}
              >
                Tạo mới
              </button>
            </div>

            <Select
              value={locationId}
              onValueChange={(value) => setValue("locationId", value || "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vị trí">
                  {selectedLocationName}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trọng lượng</Label>

            <div className="grid grid-cols-[1fr_120px] gap-0">
              <Input
                {...register("weightValue")}
                className="rounded-r-none border-r-0 text-right"
              />

              <Select
                value={watch("weightUnit")}
                onValueChange={(value) => setValue("weightUnit", value ?? "g")}
              >
                <SelectTrigger className="rounded-l-none">
                  <SelectValue placeholder="g" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </SectionCard>

      <OptionManagerDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        title="Quản lý nhóm hàng"
        items={categoryOptions}
        onItemsChange={setCategoryOptions}
        onSelect={(item) => {
          setValue("categoryId", item.id);
          setIsCategoryDialogOpen(false);
        }}
        listAction={listCategoriesAction}
        createAction={createCategoryAction}
        updateAction={updateCategoryAction}
        deleteAction={deleteCategoryAction}
      />

      <OptionManagerDialog
        open={isBrandDialogOpen}
        onOpenChange={setIsBrandDialogOpen}
        title="Quản lý thương hiệu"
        items={brandOptions}
        onItemsChange={setBrandOptions}
        onSelect={(item) => {
          setValue("brandId", item.id);
          setIsBrandDialogOpen(false);
        }}
        listAction={listBrandsAction}
        createAction={createBrandAction}
        updateAction={updateBrandAction}
        deleteAction={deleteBrandAction}
      />
      <OptionManagerDialog
        open={isLocationDialogOpen}
        onOpenChange={setIsLocationDialogOpen}
        title="Quản lý vị trí"
        items={locationOptions}
        onItemsChange={setLocationOptions}
        onSelect={(item) => {
          setValue("locationId", item.id);
          setIsLocationDialogOpen(false);
        }}
        listAction={listLocationsAction}
        createAction={(input) => createLocationAction({ name: input.name })}
        updateAction={(input) =>
          updateLocationAction({ id: input.id, name: input.name })
        }
        deleteAction={deleteLocationAction}
      />
    </div>
  );
}
