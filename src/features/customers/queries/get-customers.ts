import { db } from "@/db";
import { customers } from "@/db/schema";
import { and, desc, eq, ilike, or } from "drizzle-orm";

type GetCustomersParams = {
  storeId: string;
  search?: string;
};

export async function getCustomers(params: GetCustomersParams) {
  const conditions = [eq(customers.storeId, params.storeId)];

  if (params.search?.trim()) {
    const keyword = `%${params.search.trim()}%`;
    conditions.push(
      or(
        ilike(customers.name, keyword),
        ilike(customers.code, keyword),
        ilike(customers.phone, keyword),
        ilike(customers.email, keyword),
      )!,
    );
  }

  return db
    .select({
      id: customers.id,
      code: customers.code,
      name: customers.name,
      groupName: customers.groupName,
      phone: customers.phone,
      email: customers.email,
      gender: customers.gender,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt,
    })
    .from(customers)
    .where(and(...conditions))
    .orderBy(desc(customers.createdAt));
}
