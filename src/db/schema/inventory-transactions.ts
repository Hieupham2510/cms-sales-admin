import { integer, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { products } from "./products";
import { stores } from "./stores";

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),

  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),

  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),

  type: text("type").notNull(), // import | export | adjustment
  quantity: integer("quantity").notNull(),
  unitCost: numeric("unit_cost", { precision: 12, scale: 2 }).default("0"),

  note: text("note"),
  referenceType: text("reference_type"),
  referenceId: text("reference_id"),

  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});