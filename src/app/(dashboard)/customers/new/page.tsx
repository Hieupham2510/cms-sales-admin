import { CustomerForm } from "@/features/customers/components/customer-form";
import { createCustomerAction } from "@/features/customers/actions/create-customer-action";

export default async function NewCustomerPage() {
  return (
    <div className="page-container">
      <CustomerForm mode="create" submitAction={createCustomerAction} />
    </div>
  );
}
