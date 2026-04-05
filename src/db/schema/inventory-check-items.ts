import { index, integer, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { inventoryChecks } from "./inventory-checks";
import { products } from "./products";

export const inventoryCheckItems = pgTable(
  "inventory_check_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

  checkId: uuid("check_id")
    .notNull()
    .references(() => inventoryChecks.id, { onDelete: "cascade" }),

  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),

  sku: text("sku").notNull(),
  productName: text("product_name").notNull(),

  bookStock: integer("book_stock").notNull(),
  actualStock: integer("actual_stock").notNull(),
  diffQuantity: integer("diff_quantity").notNull(),

  unitCost: numeric("unit_cost", { precision: 12, scale: 2 }).notNull().default("0"),
  diffValue: numeric("diff_value", { precision: 14, scale: 2 }).notNull().default("0"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("inventory_check_items_check_id_idx").on(table.checkId),
    index("inventory_check_items_product_id_idx").on(table.productId),
  ],
);
