export type ProductVariantValue = {
  id: string;
  label: string;
  priceAdjustment: string;
};

export type ProductVariantGroup = {
  id: string;
  name: string;
  values: ProductVariantValue[];
};

export type SelectedVariant = {
  groupId: string;
  groupName: string;
  valueId: string;
  valueLabel: string;
  priceAdjustment: string;
};

export function normalizeProductVariants(input: unknown): ProductVariantGroup[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((group) => {
      const groupId =
        typeof (group as { id?: unknown })?.id === "string"
          ? (group as { id: string }).id
          : "";
      const groupName =
        typeof (group as { name?: unknown })?.name === "string"
          ? (group as { name: string }).name.trim()
          : "";

      const rawValues = Array.isArray((group as { values?: unknown })?.values)
        ? ((group as { values: unknown[] }).values ?? [])
        : [];

      const values = rawValues
        .map((value) => {
          const valueId =
            typeof (value as { id?: unknown })?.id === "string"
              ? (value as { id: string }).id
              : "";
          const valueLabel =
            typeof (value as { label?: unknown })?.label === "string"
              ? (value as { label: string }).label.trim()
              : "";
          const priceAdjustment =
            typeof (value as { priceAdjustment?: unknown })?.priceAdjustment === "string"
              ? (value as { priceAdjustment: string }).priceAdjustment.trim()
              : "0";

          return {
            id: valueId,
            label: valueLabel,
            priceAdjustment:
              /^\d+(\.\d{1,2})?$/.test(priceAdjustment) && priceAdjustment
                ? priceAdjustment
                : "0",
          };
        })
        .filter((value) => value.id && value.label);

      return {
        id: groupId,
        name: groupName,
        values,
      };
    })
    .filter((group) => group.id && group.name && group.values.length > 0);
}

export function calculateVariantAdjustedPrice(
  basePrice: string,
  selectedVariants: SelectedVariant[],
) {
  const base = Number(basePrice || "0");
  const adjustment = selectedVariants.reduce(
    (sum, item) => sum + Number(item.priceAdjustment || "0"),
    0,
  );

  return (base + adjustment).toFixed(2);
}

export function variantSummary(selectedVariants: SelectedVariant[]) {
  if (selectedVariants.length === 0) return "";

  return selectedVariants
    .map((item) => `${item.groupName}: ${item.valueLabel}`)
    .join(" • ");
}
