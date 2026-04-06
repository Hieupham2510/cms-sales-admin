import { NextResponse } from "next/server";
import { getActiveStoreIdOrThrow } from "@/features/auth/queries/get-auth-context";
import { getCustomerCompletedOrders } from "@/features/customers/queries/get-customer-completed-orders";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const storeId = await getActiveStoreIdOrThrow();

    const orders = await getCustomerCompletedOrders({
      storeId,
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
