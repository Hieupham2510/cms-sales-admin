import { db } from "@/db";
import { customerAddresses, customers } from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";

type Params = {
  id: string;
  storeId: string;
};

export async function getCustomerById(params: Params) {
  const rows = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, params.id), eq(customers.storeId, params.storeId)))
    .limit(1);

  const customer = rows[0];
  if (!customer) return null;

  const addresses = await db
    .select()
    .from(customerAddresses)
    .where(eq(customerAddresses.customerId, customer.id))
    .orderBy(
      desc(customerAddresses.isDefault),
      asc(customerAddresses.createdAt),
    );

  return {
    ...customer,
    addresses: addresses.map((address) => ({
      id: address.id,
      label: address.label,
      line1: address.line1,
      area: address.area,
      ward: address.ward,
      isDefault: address.isDefault,
    })),
  };
}
