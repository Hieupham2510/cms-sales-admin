"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = {
  id: string;
  name: string;
};

type ProductsFiltersValue = {
  search: string;
  stockStates: string[];
  salePriceMin: string;
  salePriceMax: string;
  costPriceMin: string;
  costPriceMax: string;
  currentStockMin: string;
  currentStockMax: string;
  customerOrderQuantityMin: string;
  customerOrderQuantityMax: string;
  categoryId: string;
  brandId: string;
  locationId: string;
};

type Props = {
  categories: Option[];
  brands: Option[];
  locations: Option[];
  initialValue: ProductsFiltersValue;
};

const STOCK_STATE_OPTIONS = [
  { value: "out", label: "Hết hàng" },
  { value: "low", label: "Sắp hết hàng" },
  { value: "ok", label: "Còn hàng" },
  { value: "high", label: "Tồn cao" },
] as const;

export function ProductsFilters({
  categories,
  brands,
  locations,
  initialValue,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState<ProductsFiltersValue>(initialValue);
  const selectedCategoryLabel =
    categories.find((item) => item.id === value.categoryId)?.name ?? "Tất cả nhóm hàng";
  const selectedBrandLabel =
    brands.find((item) => item.id === value.brandId)?.name ?? "Tất cả thương hiệu";
  const selectedLocationLabel =
    locations.find((item) => item.id === value.locationId)?.name ?? "Tất cả kho";

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (value.search.trim()) params.set("search", value.search.trim());
    value.stockStates.forEach((item) => params.append("stockState", item));

    if (value.salePriceMin.trim()) params.set("salePriceMin", value.salePriceMin.trim());
    if (value.salePriceMax.trim()) params.set("salePriceMax", value.salePriceMax.trim());

    if (value.costPriceMin.trim()) params.set("costPriceMin", value.costPriceMin.trim());
    if (value.costPriceMax.trim()) params.set("costPriceMax", value.costPriceMax.trim());

    if (value.currentStockMin.trim()) params.set("currentStockMin", value.currentStockMin.trim());
    if (value.currentStockMax.trim()) params.set("currentStockMax", value.currentStockMax.trim());

    if (value.customerOrderQuantityMin.trim()) {
      params.set("customerOrderQuantityMin", value.customerOrderQuantityMin.trim());
    }
    if (value.customerOrderQuantityMax.trim()) {
      params.set("customerOrderQuantityMax", value.customerOrderQuantityMax.trim());
    }

    if (value.categoryId) params.set("categoryId", value.categoryId);
    if (value.brandId) params.set("brandId", value.brandId);
    if (value.locationId) params.set("locationId", value.locationId);

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const clearFilters = () => {
    setValue({
      search: "",
      stockStates: [],
      salePriceMin: "",
      salePriceMax: "",
      costPriceMin: "",
      costPriceMax: "",
      currentStockMin: "",
      currentStockMax: "",
      customerOrderQuantityMin: "",
      customerOrderQuantityMax: "",
      categoryId: "",
      brandId: "",
      locationId: "",
    });
    router.push(pathname);
  };

  const toggleStockState = (state: string) => {
    setValue((prev) => {
      if (prev.stockStates.includes(state)) {
        return {
          ...prev,
          stockStates: prev.stockStates.filter((item) => item !== state),
        };
      }

      return {
        ...prev,
        stockStates: [...prev.stockStates, state],
      };
    });
  };

  const applyStockPreset = (preset: "zero" | "one-ten" | "ten-hundred" | "hundred-plus") => {
    if (preset === "zero") {
      setValue((prev) => ({ ...prev, currentStockMin: "0", currentStockMax: "0" }));
      return;
    }

    if (preset === "one-ten") {
      setValue((prev) => ({ ...prev, currentStockMin: "1", currentStockMax: "10" }));
      return;
    }

    if (preset === "ten-hundred") {
      setValue((prev) => ({ ...prev, currentStockMin: "10", currentStockMax: "100" }));
      return;
    }

    setValue((prev) => ({ ...prev, currentStockMin: "100", currentStockMax: "" }));
  };

  return (
    <Card className="app-card sticky top-16 h-fit">
      <CardHeader className="app-card-header">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <SlidersHorizontal className="size-4" />
          Bộ lọc
        </CardTitle>
      </CardHeader>
      <CardContent className="app-card-content space-y-4">
        <div className="space-y-2">
          <Label htmlFor="products-filter-search">Mã hàng / Tên hàng</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="products-filter-search"
              value={value.search}
              onChange={(event) => setValue((prev) => ({ ...prev, search: event.target.value }))}
              placeholder="Nhập từ khóa..."
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Trạng thái tồn kho</Label>
          <div className="space-y-2">
            {STOCK_STATE_OPTIONS.map((item) => (
              <label key={item.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={value.stockStates.includes(item.value)}
                  onChange={() => toggleStockState(item.value)}
                  className="size-4 rounded-sm border border-input accent-primary"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Giá bán (VND)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Từ"
              value={value.salePriceMin}
              onChange={(event) => setValue((prev) => ({ ...prev, salePriceMin: event.target.value }))}
            />
            <Input
              type="number"
              min={0}
              placeholder="Đến"
              value={value.salePriceMax}
              onChange={(event) => setValue((prev) => ({ ...prev, salePriceMax: event.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Giá vốn (VND)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Từ"
              value={value.costPriceMin}
              onChange={(event) => setValue((prev) => ({ ...prev, costPriceMin: event.target.value }))}
            />
            <Input
              type="number"
              min={0}
              placeholder="Đến"
              value={value.costPriceMax}
              onChange={(event) => setValue((prev) => ({ ...prev, costPriceMax: event.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tồn kho</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Từ"
              value={value.currentStockMin}
              onChange={(event) => setValue((prev) => ({ ...prev, currentStockMin: event.target.value }))}
            />
            <Input
              type="number"
              min={0}
              placeholder="Đến"
              value={value.currentStockMax}
              onChange={(event) => setValue((prev) => ({ ...prev, currentStockMax: event.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" size="xs" onClick={() => applyStockPreset("zero")}>
              0
            </Button>
            <Button type="button" variant="outline" size="xs" onClick={() => applyStockPreset("one-ten")}>
              1-10
            </Button>
            <Button type="button" variant="outline" size="xs" onClick={() => applyStockPreset("ten-hundred")}>
              10-100
            </Button>
            <Button type="button" variant="outline" size="xs" onClick={() => applyStockPreset("hundred-plus")}>
              100+
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Khách đặt</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Từ"
              value={value.customerOrderQuantityMin}
              onChange={(event) =>
                setValue((prev) => ({ ...prev, customerOrderQuantityMin: event.target.value }))
              }
            />
            <Input
              type="number"
              min={0}
              placeholder="Đến"
              value={value.customerOrderQuantityMax}
              onChange={(event) =>
                setValue((prev) => ({ ...prev, customerOrderQuantityMax: event.target.value }))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Nhóm hàng</Label>
          <Select
            value={value.categoryId || "__all"}
            onValueChange={(next) =>
              setValue((prev) => ({
                ...prev,
                categoryId: !next || next === "__all" ? "" : next,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tất cả nhóm hàng">{selectedCategoryLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Tất cả nhóm hàng</SelectItem>
              {categories.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Thương hiệu</Label>
          <Select
            value={value.brandId || "__all"}
            onValueChange={(next) =>
              setValue((prev) => ({
                ...prev,
                brandId: !next || next === "__all" ? "" : next,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tất cả thương hiệu">{selectedBrandLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Tất cả thương hiệu</SelectItem>
              {brands.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Kho</Label>
          <Select
            value={value.locationId || "__all"}
            onValueChange={(next) =>
              setValue((prev) => ({
                ...prev,
                locationId: !next || next === "__all" ? "" : next,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tất cả kho">{selectedLocationLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Tất cả kho</SelectItem>
              {locations.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={clearFilters}>
            Xóa lọc
          </Button>
          <Button type="button" className="flex-1" onClick={applyFilters}>
            Áp dụng
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
