import { NextResponse } from "next/server";
import { getCustomerCompletedOrders } from "@/features/customers/queries/get-customer-completed-orders";

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const orders = await getCustomerCompletedOrders({
      storeId: DEMO_STORE_ID,
      customerId: id,
    });

    return NextResponse.json({
      orders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Không thể lấy lịch sử mua hàng",
      },
      { status: 500 },
    );
  }
}
