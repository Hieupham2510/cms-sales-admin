import {
  bigserial,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { stores } from "./stores";

export const inventoryChecks = pgTable(
  "inventory_checks",
  {
    id: uuid("id").defaultRandom().primaryKey(),

  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),

  codeNo: bigserial("code_no", { mode: "number" }).notNull().unique(),

  status: text("status").notNull().default("balanced"),
  note: text("note"),

  actualQuantityTotal: integer("actual_quantity_total").notNull().default(0),
  actualValueTotal: numeric("actual_value_total", {
    precision: 14,
    scale: 2,
  }).notNull().default("0"),

  totalDiffQuantity: integer("total_diff_quantity").notNull().default(0),
  increaseDiffQuantity: integer("increase_diff_quantity").notNull().default(0),
  decreaseDiffQuantity: integer("decrease_diff_quantity").notNull().default(0),

  createdBy: uuid("created_by").references(() => profiles.id, {
    onDelete: "set null",
  }),
  balancedBy: uuid("balanced_by").references(() => profiles.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    balancedAt: timestamp("balanced_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("inventory_checks_store_id_idx").on(table.storeId),
    index("inventory_checks_created_at_idx").on(table.createdAt),
  ],
);
