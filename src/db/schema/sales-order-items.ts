import { integer, jsonb, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { SelectedVariant } from "@/features/products/variant-utils";
import { products } from "./products";
import { salesOrders } from "./sales-orders";

export const salesOrderItems = pgTable("sales_order_items", {
  id: uuid("id").defaultRandom().primaryKey(),

  orderId: uuid("order_id")
    .notNull()
    .references(() => salesOrders.id, { onDelete: "cascade" }),

  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),

  skuSnapshot: text("sku_snapshot").notNull(),
  nameSnapshot: text("name_snapshot").notNull(),

  selectedVariants: jsonb("selected_variants")
    .$type<SelectedVariant[]>()
    .notNull()
    .default([]),

  unitPrice: numeric("unit_price", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),

  quantity: integer("quantity").notNull().default(1),

  lineTotal: numeric("line_total", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
