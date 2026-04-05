import { NextResponse } from "next/server";
import { uploadProductImage } from "@/features/products/lib/upload-product-image";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Thiếu file ảnh" }, { status: 400 });
    }

    const uploaded = await uploadProductImage(file);

    return NextResponse.json({
      publicUrl: uploaded.publicUrl,
      path: uploaded.path,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload ảnh thất bại",
      },
      { status: 500 },
    );
  }
}
