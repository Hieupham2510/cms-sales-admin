"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { customerAddresses, customers } from "@/db/schema";
import {
  customerFormSchema,
  type CustomerFormValues,
} from "@/features/customers/schemas/customer-form-schema";

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f";

export async function updateCustomerAction(
  customerId: string,
  values: CustomerFormValues,
) {
  const parsed = customerFormSchema.parse(values);

  return db.transaction(async (tx) => {
    await tx
      .update(customers)
      .set({
        code: parsed.code,
        name: parsed.name,
        groupName: parsed.groupName ?? null,
        dateOfBirth: parsed.dateOfBirth ?? null,
        gender: parsed.gender ?? null,
        phone: parsed.phone ?? null,
        email: parsed.email ?? null,
        facebook: parsed.facebook ?? null,
        note: parsed.note ?? null,
        billingCustomerType: parsed.billingCustomerType,
        billingBuyerName: parsed.billingBuyerName ?? null,
        billingTaxCode: parsed.billingTaxCode ?? null,
        billingNationalId: parsed.billingNationalId ?? null,
        billingPassport: parsed.billingPassport ?? null,
        billingEmail: parsed.billingEmail ?? null,
        billingPhone: parsed.billingPhone ?? null,
        billingBankName: parsed.billingBankName ?? null,
        billingBankAccount: parsed.billingBankAccount ?? null,
        billingAddressLine: parsed.billingAddressLine ?? null,
        billingArea: parsed.billingArea ?? null,
        billingWard: parsed.billingWard ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(customers.id, customerId), eq(customers.storeId, DEMO_STORE_ID)));

    await tx
      .delete(customerAddresses)
      .where(eq(customerAddresses.customerId, customerId));

    const normalizedAddresses = parsed.addresses.map((address, index) => ({
      customerId,
      label: address.label ?? null,
      line1: address.line1,
      area: address.area ?? null,
      ward: address.ward ?? null,
      isDefault:
        parsed.addresses.some((item) => item.isDefault)
          ? address.isDefault
          : index === 0,
      updatedAt: new Date(),
    }));

    if (normalizedAddresses.length > 0) {
      await tx.insert(customerAddresses).values(normalizedAddresses);
    }

    return { success: true };
  });
}
