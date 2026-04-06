"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createSalesOrderAction } from "@/features/sales/actions/create-sales-order-action";
import { SalesCustomerQuickCreateDialog } from "@/features/sales/components/sales-customer-quick-create-dialog";
import { formatCurrency } from "@/features/sales/utils";
import {
  calculateVariantAdjustedPrice,
  normalizeProductVariants,
  variantSummary,
  type ProductVariantGroup,
  type SelectedVariant,
} from "@/features/products/variant-utils";

type ProductOption = {
  id: string;
  sku: string;
  name: string;
  salePrice: string;
  variants: ProductVariantGroup[];
  currentStock: number;
  status: string;
  thumbnailUrl: string | null;
};

type CustomerOption = {
  id: string;
  code: string;
  name: string;
  phone: string | null;
};

type Props = {
  initialProducts: ProductOption[];
  customers: CustomerOption[];
};

type CartItem = {
  key: string;
  productId: string;
  selectedVariants: SelectedVariant[];
  unitPrice: string;
  quantity: number;
};

const paymentMethodOptions = [
  { value: "cash", label: "Tiền mặt" },
  { value: "bank_transfer", label: "Chuyển khoản" },
  { value: "card", label: "Thẻ" },
  { value: "e_wallet", label: "Ví điện tử" },
] as const;

const NO_VARIANT_VALUE = "__none__";

export function SalesPos({ initialProducts, customers }: Props) {
  const router = useRouter();
  const [products] = useState<ProductOption[]>(initialProducts);
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>(customers);
  const [productSearch, setProductSearch] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [variantPickerProductId, setVariantPickerProductId] = useState<string | null>(null);
  const [variantSelections, setVariantSelections] = useState<Record<string, string>>({});
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "bank_transfer" | "card" | "e_wallet"
  >("cash");
  const [note, setNote] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [stockErrorIds, setStockErrorIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const productMap = useMemo(
    () =>
      new Map(
        products.map((item) => [
          item.id,
          {
            ...item,
            variants: normalizeProductVariants(item.variants),
          },
        ]),
      ),
    [products],
  );

  const variantPickerProduct = useMemo(() => {
    if (!variantPickerProductId) return null;
    return productMap.get(variantPickerProductId) ?? null;
  }, [productMap, variantPickerProductId]);

  const selectedCustomer = useMemo(
    () => customerOptions.find((item) => item.id === selectedCustomerId) ?? null,
    [customerOptions, selectedCustomerId],
  );

  const paymentMethodLabel = useMemo(
    () => paymentMethodOptions.find((item) => item.value === paymentMethod)?.label ?? "",
    [paymentMethod],
  );

  const filteredProducts = useMemo(() => {
    const keyword = productSearch.trim().toLowerCase();

    if (!keyword) return products;

    return products.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.sku.toLowerCase().includes(keyword),
    );
  }, [productSearch, products]);

  const detailedCart = useMemo(() => {
    return cartItems
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;

        const lineTotal = Number(item.unitPrice) * item.quantity;

        return {
          ...item,
          product,
          lineTotal,
          isInsufficient: item.quantity > product.currentStock,
        };
      })
      .filter(Boolean) as Array<{
      productId: string;
      key: string;
      selectedVariants: SelectedVariant[];
      unitPrice: string;
      quantity: number;
      lineTotal: number;
      isInsufficient: boolean;
      product: ProductOption;
    }>;
  }, [cartItems, productMap]);

  const subtotal = useMemo(
    () => detailedCart.reduce((sum, item) => sum + item.lineTotal, 0),
    [detailedCart],
  );

  const hasInsufficientStock = detailedCart.some((item) => item.isInsufficient);
  const selectedVariantsForPicker = useMemo(() => {
    if (!variantPickerProduct) return [];

    return variantPickerProduct.variants
      .map((group) => {
        const selectedValueId = variantSelections[group.id];
        if (!selectedValueId || selectedValueId === NO_VARIANT_VALUE) return null;
        const value = group.values.find((item) => item.id === selectedValueId);
        if (!value) return null;

        return {
          groupId: group.id,
          groupName: group.name,
          valueId: value.id,
          valueLabel: value.label,
          priceAdjustment: value.priceAdjustment,
        } satisfies SelectedVariant;
      })
      .filter((item): item is SelectedVariant => Boolean(item));
  }, [variantPickerProduct, variantSelections]);

  function getCartItemKey(productId: string, selectedVariants: SelectedVariant[]) {
    const variantKey = selectedVariants.map((item) => `${item.groupId}:${item.valueId}`).join("|");
    return variantKey ? `${productId}::${variantKey}` : productId;
  }

  function addProductLine(productId: string, selectedVariants: SelectedVariant[]) {
    const product = productMap.get(productId);
    if (!product) return;

    const unitPrice = calculateVariantAdjustedPrice(product.salePrice, selectedVariants);
    const key = getCartItemKey(productId, selectedVariants);

    setCartItems((prev) => {
      const found = prev.find((item) => item.key === key);
      if (found) {
        return prev.map((item) =>
          item.key === key
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...prev,
        {
          key,
          productId,
          selectedVariants,
          unitPrice,
          quantity: 1,
        },
      ];
    });
  }

  function handlePickProduct(productId: string) {
    const product = productMap.get(productId);
    if (!product) return;

    if (product.variants.length === 0) {
      addProductLine(productId, []);
      return;
    }

    const initialSelections: Record<string, string> = {};
    for (const group of product.variants) {
      initialSelections[group.id] = NO_VARIANT_VALUE;
    }
    setVariantSelections(initialSelections);
    setVariantPickerProductId(productId);
  }

  function handleConfirmVariantPicker() {
    if (!variantPickerProduct) return;

    addProductLine(variantPickerProduct.id, selectedVariantsForPicker);
    setVariantPickerProductId(null);
    setVariantSelections({});
  }

  function removeProduct(itemKey: string) {
    const target = cartItems.find((item) => item.key === itemKey);
    setCartItems((prev) => prev.filter((item) => item.key !== itemKey));
    if (!target) return;
    setStockErrorIds((prev) => prev.filter((item) => item !== target.productId));
  }

  function changeQuantity(itemKey: string, quantity: number) {
    if (quantity <= 0) {
      removeProduct(itemKey);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.key === itemKey
          ? {
              ...item,
              quantity,
            }
          : item,
      ),
    );
  }

  function handleOpenCheckout() {
    if (cartItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm");
      return;
    }

    const insufficientIds = detailedCart
      .filter((item) => item.isInsufficient)
      .map((item) => item.productId);

    if (insufficientIds.length > 0) {
      setStockErrorIds(insufficientIds);
      toast.error("Một số sản phẩm không đủ tồn kho");
      return;
    }

    setStockErrorIds([]);
    setCheckoutOpen(true);
  }

  function handleCheckout() {
    if (!selectedCustomerId) {
      toast.error("Vui lòng chọn khách hàng");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createSalesOrderAction({
          customerId: selectedCustomerId,
          paymentMethod,
          note,
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            selectedVariants: item.selectedVariants.map((variant) => ({
              groupId: variant.groupId,
              valueId: variant.valueId,
            })),
          })),
        });

        if (!result.success) {
          if (result.code === "OUT_OF_STOCK") {
            setStockErrorIds(result.stockIssues.map((item) => item.productId));
            toast.error("Có sản phẩm không đủ tồn kho, vui lòng kiểm tra lại");
            setCheckoutOpen(false);
            return;
          }

          toast.error("Không thể tạo đơn bán");
          return;
        }

        toast.success(`Tạo đơn ${result.orderCode} thành công`);

        setCheckoutOpen(false);
        setCartItems([]);
        setStockErrorIds([]);
        setNote("");

        window.open(`/sales/orders/${result.orderId}/print`, "_blank", "noopener,noreferrer");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể thanh toán");
      }
    });
  }

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <section className="table-shell min-h-[640px]">
          <div className="border-b px-4 py-3.5">
            <h2 className="text-base font-semibold">Hóa đơn tạm</h2>
          </div>

          <div className="space-y-3 p-4">
            {detailedCart.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                Chưa có sản phẩm trong hóa đơn.
              </div>
            ) : (
              detailedCart.map((item, index) => {
                const hasStockError =
                  item.isInsufficient || stockErrorIds.includes(item.productId);

                return (
                  <div
                    key={item.key}
                    className={`rounded-lg border p-3 ${
                      hasStockError ? "border-destructive" : "border-border"
                    }`}
                  >
                    <div className="grid grid-cols-[28px_1fr_auto_auto] items-start gap-3">
                      <div className="pt-1 text-sm tabular text-muted-foreground">
                        {index + 1}
                      </div>

                      <div>
                        <div
                          className={`font-medium ${
                            hasStockError ? "font-semibold text-destructive" : ""
                          }`}
                        >
                          {item.product.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{item.product.sku}</div>
                        {item.selectedVariants.length > 0 ? (
                          <div className="text-xs text-muted-foreground">
                            {variantSummary(item.selectedVariants)}
                          </div>
                        ) : null}

                        {hasStockError ? (
                          <p className="mt-1 text-xs font-semibold text-destructive">
                            Tồn kho hiện tại: {item.product.currentStock}
                          </p>
                        ) : null}
                      </div>

                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) =>
                          changeQuantity(item.key, Number(event.target.value || 0))
                        }
                        className="h-8 w-20 text-right tabular"
                      />

                      <div className="flex items-center gap-2">
                        <div className="min-w-[110px] text-right font-semibold tabular">
                          {formatCurrency(item.lineTotal)}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeProduct(item.key)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-auto border-t px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tổng tiền hàng ({detailedCart.length})</span>
              <span className="tabular text-base font-semibold">{formatCurrency(subtotal)}</span>
            </div>
          </div>
        </section>

        <section className="table-shell min-h-[640px]">
          <div className="space-y-3 border-b p-4">
            <Input
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="Tìm hàng hóa"
            />
          </div>

          <div className="grid max-h-[520px] grid-cols-1 gap-2 overflow-auto p-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 hover:bg-muted/30"
              >
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-md border bg-muted/40">
                  {product.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.thumbnailUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">IMG</span>
                  )}
                </div>

                <div>
                  <Link
                    href={`/products/${product.id}`}
                    className="line-clamp-1 text-sm font-medium hover:text-primary hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary tabular">
                      {formatCurrency(product.salePrice)}
                    </span>
                    {product.variants.length > 0 ? (
                      <Badge className="bg-info/15 text-info border-transparent">
                        Biến thể
                      </Badge>
                    ) : null}
                    <Badge
                      className={
                        product.currentStock > 0
                          ? "status-badge-success"
                          : "status-badge-out-of-stock"
                      }
                    >
                      Tồn: {product.currentStock}
                    </Badge>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={() => handlePickProduct(product.id)}
                  title="Thêm vào hóa đơn"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="border-t p-3">
            <Button type="button" className="w-full" onClick={handleOpenCheckout}>
              Thanh toán
            </Button>

            {hasInsufficientStock ? (
              <p className="mt-2 text-xs font-semibold text-destructive">
                Có sản phẩm vượt quá tồn kho hiện tại.
              </p>
            ) : null}
          </div>
        </section>

        <Dialog
          open={Boolean(variantPickerProduct)}
          onOpenChange={(open) => {
            if (!open) {
              setVariantPickerProductId(null);
              setVariantSelections({});
            }
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Chọn biến thể sản phẩm</DialogTitle>
            </DialogHeader>

            {variantPickerProduct ? (
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{variantPickerProduct.name}</p>
                  <p className="text-xs text-muted-foreground">{variantPickerProduct.sku}</p>
                </div>

                {variantPickerProduct.variants.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <Label>{group.name}</Label>
                    {(() => {
                      const selectedValue = group.values.find(
                        (item) => item.id === variantSelections[group.id],
                      );

                      return (
                    <Select
                      value={variantSelections[group.id] ?? ""}
                      onValueChange={(value) =>
                        setVariantSelections((prev) => ({
                          ...prev,
                          [group.id]: value ?? "",
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Chọn ${group.name.toLowerCase()}`}>
                          {selectedValue?.label ?? "Không chọn"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_VARIANT_VALUE}>Không chọn</SelectItem>
                        {group.values.map((value) => (
                          <SelectItem key={value.id} value={value.id}>
                            {value.label}
                            {Number(value.priceAdjustment) > 0
                              ? ` (+${formatCurrency(value.priceAdjustment)})`
                              : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                      );
                    })()}
                  </div>
                ))}

                <div className="rounded-lg border p-3 text-sm">
                  <p className="text-muted-foreground">Đơn giá sau biến thể</p>
                  <p className="tabular text-lg font-semibold">
                    {formatCurrency(
                      calculateVariantAdjustedPrice(
                        variantPickerProduct.salePrice,
                        selectedVariantsForPicker,
                      ),
                    )}
                  </p>
                  {selectedVariantsForPicker.length > 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {variantSummary(selectedVariantsForPicker)}
                    </p>
                  ) : null}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setVariantPickerProductId(null);
                      setVariantSelections({});
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="button" onClick={handleConfirmVariantPicker}>
                    Thêm vào hóa đơn
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <DialogContent className="!top-0 !bottom-0 !left-auto !right-0 !m-0 !h-screen !w-full !max-w-[460px] !translate-x-0 !translate-y-0 rounded-none border-l p-0 sm:!max-w-[460px]">
            <DialogHeader className="border-b px-4 py-3">
              <DialogTitle>Thanh toán</DialogTitle>
            </DialogHeader>

            <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden">
              <div className="space-y-4 overflow-y-auto px-4 py-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label>Khách hàng (bắt buộc)</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setCreateCustomerOpen(true)}
                    >
                      Thêm mới khách hàng
                    </Button>
                  </div>

                  <Select
                    value={selectedCustomerId}
                    onValueChange={(value) => setSelectedCustomerId(value ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn khách hàng">
                        {selectedCustomer
                          ? `${selectedCustomer.name} (${selectedCustomer.code})`
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {customerOptions.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} ({customer.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Phương thức thanh toán</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value) =>
                      setPaymentMethod(
                        (value as "cash" | "bank_transfer" | "card" | "e_wallet" | null) ??
                          "cash",
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn phương thức">
                        {paymentMethodLabel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sản phẩm trong đơn</Label>
                  <div className="max-h-[220px] space-y-2 overflow-y-auto rounded-lg border p-2">
                    {detailedCart.map((item) => (
                      <div key={item.key} className="rounded-md border px-2 py-2">
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.product.sku}</p>
                        {item.selectedVariants.length > 0 ? (
                          <p className="text-xs text-muted-foreground">
                            {variantSummary(item.selectedVariants)}
                          </p>
                        ) : null}
                        <p className="mt-1 text-sm tabular">
                          {item.quantity} x {formatCurrency(item.unitPrice)} ={" "}
                          <span className="font-semibold">{formatCurrency(item.lineTotal)}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Ghi chú đơn hàng</Label>
                  <Textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Nhập ghi chú..."
                  />
                </div>
              </div>

              <div className="space-y-2 border-t px-4 py-4">
                <p className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tổng tiền hàng</span>
                  <span className="tabular font-semibold">{formatCurrency(subtotal)}</span>
                </p>

                <Button
                  type="button"
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={isPending}
                >
                  {isPending ? "Đang xử lý..." : "Thanh toán"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <SalesCustomerQuickCreateDialog
        open={createCustomerOpen}
        onOpenChange={setCreateCustomerOpen}
        onCreated={(customer) => {
          setCustomerOptions((prev) => [customer, ...prev.filter((item) => item.id !== customer.id)]);
          setSelectedCustomerId(customer.id);
        }}
      />
    </>
  );
}
