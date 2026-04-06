import { numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { customers } from "./customers";
import { profiles } from "./profiles";
import { stores } from "./stores";

export const salesOrders = pgTable("sales_orders", {
  id: uuid("id").defaultRandom().primaryKey(),

  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),

  orderCode: text("order_code").notNull(),

  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),

  status: text("status").notNull().default("processing"),

  subtotalAmount: numeric("subtotal_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),

  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),

  totalAmount: numeric("total_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),

  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),

  paymentMethod: text("payment_method").notNull().default("cash"),
  note: text("note"),

  soldBy: uuid("sold_by").references(() => profiles.id, {
    onDelete: "set null",
  }),

  soldAt: timestamp("sold_at", { withTimezone: true }).defaultNow().notNull(),

  statusChangedAt: timestamp("status_changed_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  statusChangedBy: uuid("status_changed_by").references(() => profiles.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
