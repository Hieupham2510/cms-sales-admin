import { NextResponse } from "next/server";
import { getProductById } from "@/features/products/queries/get-product-by-id";

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const product = await getProductById({
      id,
      storeId: DEMO_STORE_ID,
    });

    if (!product) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    return NextResponse.json({
      id: product.id,
      name: product.name,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Không thể lấy thông tin sản phẩm",
      },
      { status: 500 },
    );
  }
}
