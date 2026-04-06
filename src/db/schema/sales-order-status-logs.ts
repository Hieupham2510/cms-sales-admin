import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { salesOrders } from "./sales-orders";

export const salesOrderStatusLogs = pgTable("sales_order_status_logs", {
  id: uuid("id").defaultRandom().primaryKey(),

  orderId: uuid("order_id")
    .notNull()
    .references(() => salesOrders.id, { onDelete: "cascade" }),

  fromStatus: text("from_status").notNull(),
  toStatus: text("to_status").notNull(),
  reason: text("reason"),

  changedBy: uuid("changed_by").references(() => profiles.id, {
    onDelete: "set null",
  }),

  changedAt: timestamp("changed_at", { withTimezone: true }).defaultNow().notNull(),
});
