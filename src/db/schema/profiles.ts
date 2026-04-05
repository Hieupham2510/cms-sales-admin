import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  username: text("username").notNull().unique(),
  fullName: text("full_name"),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("staff"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
