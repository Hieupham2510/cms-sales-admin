import { NextResponse } from "next/server";
import { getActiveStoreIdOrThrow } from "@/features/auth/queries/get-auth-context";
import { getCustomerById } from "@/features/customers/queries/get-customer-by-id";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const storeId = await getActiveStoreIdOrThrow();
    const customer = await getCustomerById({
      id,
      storeId,
    });

    if (!customer) {
      return NextResponse.json({ error: "Không tìm thấy khách hàng" }, { status: 404 });
    }

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      code: customer.code,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Không thể lấy dữ liệu khách hàng",
      },
      { status: 500 },
    );
  }
}
