"use server";

import { db } from "@/db";
import { customerAddresses, customers } from "@/db/schema";
import {
  customerFormSchema,
  type CustomerFormValues,
} from "@/features/customers/schemas/customer-form-schema";

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f";

export async function createCustomerAction(values: CustomerFormValues) {
  const parsed = customerFormSchema.parse(values);

  return db.transaction(async (tx) => {
    const rows = await tx
      .insert(customers)
      .values({
        storeId: DEMO_STORE_ID,
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
      .returning({
        id: customers.id,
      });

    const customer = rows[0];

    const normalizedAddresses = parsed.addresses.map((address, index) => ({
      customerId: customer.id,
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

    return {
      id: customer.id,
    };
  });
}
