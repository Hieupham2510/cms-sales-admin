import { NextResponse } from "next/server";
import { getActiveStoreIdOrThrow } from "@/features/auth/queries/get-auth-context";
import { getProductById } from "@/features/products/queries/get-product-by-id";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const storeId = await getActiveStoreIdOrThrow();

    const product = await getProductById({
      id,
      storeId,
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
