import { and, asc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { customers } from "@/db/schema";

type Params = {
  storeId: string;
  search?: string;
  limit?: number;
};

export async function getSalesCustomers(params: Params) {
  const limit = Math.min(Math.max(params.limit ?? 120, 1), 300);
  const conditions = [eq(customers.storeId, params.storeId)];

  if (params.search?.trim()) {
    const keyword = `%${params.search.trim()}%`;
    conditions.push(
      or(
        ilike(customers.name, keyword),
        ilike(customers.code, keyword),
        ilike(customers.phone, keyword),
      )!,
    );
  }

  const rows = await db
    .select({
      id: customers.id,
      code: customers.code,
      name: customers.name,
      phone: customers.phone,
    })
    .from(customers)
    .where(and(...conditions))
    .orderBy(asc(customers.name))
    .limit(limit);

  const guestIndex = rows.findIndex((item) => item.name.toLowerCase().includes("khách lẻ"));

  if (guestIndex <= 0) return rows;

  const guest = rows[guestIndex];
  return [guest, ...rows.slice(0, guestIndex), ...rows.slice(guestIndex + 1)];
}
