import { z } from "zod";

const emptyStringToNull = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const addressSchema = z.object({
  id: z.string().optional(),
  label: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  line1: z.string().trim().min(1, "Địa chỉ chi tiết là bắt buộc"),
  area: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  ward: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  isDefault: z.boolean().default(false),
});

export const customerFormSchema = z.object({
  code: z.string().trim().min(1, "Mã khách hàng là bắt buộc"),
  name: z.string().trim().min(1, "Tên khách hàng là bắt buộc"),
  groupName: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  dateOfBirth: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  gender: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  phone: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  email: z.preprocess(
    emptyStringToNull,
    z.string().email("Email không hợp lệ").nullable().optional(),
  ),
  facebook: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  note: z.preprocess(emptyStringToNull, z.string().nullable().optional()),

  billingCustomerType: z.enum(["individual", "business"]).default("individual"),
  billingBuyerName: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  billingTaxCode: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  billingNationalId: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  billingPassport: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  billingEmail: z.preprocess(
    emptyStringToNull,
    z.string().email("Email xuất hóa đơn không hợp lệ").nullable().optional(),
  ),
  billingPhone: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  billingBankName: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  billingBankAccount: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  billingAddressLine: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  billingArea: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  billingWard: z.preprocess(emptyStringToNull, z.string().nullable().optional()),

  addresses: z.array(addressSchema).default([]),
});

export type CustomerFormInput = z.input<typeof customerFormSchema>;
export type CustomerFormValues = z.output<typeof customerFormSchema>;
