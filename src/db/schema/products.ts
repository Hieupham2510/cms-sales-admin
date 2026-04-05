import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { brands } from "./brands";
import { categories } from "./categories";
import { locations } from "./locations";
import { stores } from "./stores";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),

  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),

  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),

  brandId: uuid("brand_id").references(() => brands.id, {
    onDelete: "set null",
  }),

  locationId: uuid("location_id").references(() => locations.id, {
    onDelete: "set null",
  }),

  sku: text("sku").notNull(),
  barcode: text("barcode"),

  name: text("name").notNull(),

  costPrice: numeric("cost_price", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),

  salePrice: numeric("sale_price", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),

  currentStock: integer("current_stock").notNull().default(0),
  minStockAlert: integer("min_stock_alert").notNull().default(0),
  maxStockAlert: integer("max_stock_alert").notNull().default(0),

  weightValue: numeric("weight_value", { precision: 10, scale: 2 }).default("0"),
  weightUnit: text("weight_unit").notNull().default("g"),

  description: text("description"),
  orderNote: text("order_note"),

  status: text("status").notNull().default("active"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});