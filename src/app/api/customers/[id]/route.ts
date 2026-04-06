import { NextResponse } from "next/server";
import { getCustomerById } from "@/features/customers/queries/get-customer-by-id";

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const customer = await getCustomerById({
      id,
      storeId: DEMO_STORE_ID,
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
