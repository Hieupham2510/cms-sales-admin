import {
  date,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { stores } from "./stores";

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),

  code: text("code").notNull(),
  name: text("name").notNull(),
  groupName: text("group_name"),
  dateOfBirth: date("date_of_birth"),
  gender: text("gender"),
  phone: text("phone"),
  email: text("email"),
  facebook: text("facebook"),
  note: text("note"),

  billingCustomerType: text("billing_customer_type").notNull().default("individual"),
  billingBuyerName: text("billing_buyer_name"),
  billingTaxCode: text("billing_tax_code"),
  billingNationalId: text("billing_national_id"),
  billingPassport: text("billing_passport"),
  billingEmail: text("billing_email"),
  billingPhone: text("billing_phone"),
  billingBankName: text("billing_bank_name"),
  billingBankAccount: text("billing_bank_account"),
  billingAddressLine: text("billing_address_line"),
  billingArea: text("billing_area"),
  billingWard: text("billing_ward"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
