import { notFound } from "next/navigation";
import { CustomerForm } from "@/features/customers/components/customer-form";
import CustomerCreatedToast from "@/features/customers/components/customer-created-toast";
import { getActiveStoreIdOrThrow } from "@/features/auth/queries/get-auth-context";
import { updateCustomerAction } from "@/features/customers/actions/update-customer-action";
import { getCustomerById } from "@/features/customers/queries/get-customer-by-id";
import type { CustomerFormValues } from "@/features/customers/schemas/customer-form-schema";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const storeId = await getActiveStoreIdOrThrow();
  const customer = await getCustomerById({ id, storeId });

  if (!customer) {
    notFound();
  }

  async function submitAction(values: CustomerFormValues) {
    "use server";
    return updateCustomerAction(id, values);
  }

  return (
    <div className="page-container">
      <CustomerCreatedToast />
      <CustomerForm
        mode="edit"
        submitAction={submitAction}
        defaultValues={{
          code: customer.code,
          name: customer.name,
          groupName: customer.groupName ?? "",
          dateOfBirth: customer.dateOfBirth ?? "",
          gender: customer.gender ?? "",
          phone: customer.phone ?? "",
          email: customer.email ?? "",
          facebook: customer.facebook ?? "",
          note: customer.note ?? "",
          billingCustomerType:
            customer.billingCustomerType === "business"
              ? "business"
              : "individual",
          billingBuyerName: customer.billingBuyerName ?? "",
          billingTaxCode: customer.billingTaxCode ?? "",
          billingNationalId: customer.billingNationalId ?? "",
          billingPassport: customer.billingPassport ?? "",
          billingEmail: customer.billingEmail ?? "",
          billingPhone: customer.billingPhone ?? "",
          billingBankName: customer.billingBankName ?? "",
          billingBankAccount: customer.billingBankAccount ?? "",
          billingAddressLine: customer.billingAddressLine ?? "",
          billingArea: customer.billingArea ?? "",
          billingWard: customer.billingWard ?? "",
          addresses: customer.addresses.map((address) => ({
            id: address.id,
            label: address.label ?? "",
            line1: address.line1,
            area: address.area ?? "",
            ward: address.ward ?? "",
            isDefault: address.isDefault,
          })),
        }}
      />
    </div>
  );
}
