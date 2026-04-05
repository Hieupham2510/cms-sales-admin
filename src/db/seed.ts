import { db } from "@/db";
import { categories, products, stores, suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting seed...");
  console.log("Using DATABASE_URL:", process.env.DATABASE_URL?.replace(/:[^:@/]+@/, ":****@"));

  const storeSlug = "demo-store";

  const existingStore = await db
    .select()
    .from(stores)
    .where(eq(stores.slug, storeSlug))
    .limit(1);

  let storeId: string;

  if (existingStore.length > 0) {
    storeId = existingStore[0].id;
    console.log("🏪 Store already exists:", storeId);
  } else {
    const insertedStore = await db
      .insert(stores)
      .values({
        name: "Demo Store",
        slug: storeSlug,
      })
      .returning();

    storeId = insertedStore[0].id;
    console.log("🏪 Store created:", storeId);
  }

  const existingCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.storeId, storeId));

  const categoryMap = new Map<string, string>();

  if (existingCategories.length === 0) {
    const insertedCategories = await db
      .insert(categories)
      .values([
        {
          storeId,
          name: "Điện tử",
          slug: "dien-tu",
          description: "Thiết bị điện tử và phụ kiện",
        },
        {
          storeId,
          name: "Phụ kiện",
          slug: "phu-kien",
          description: "Phụ kiện bán kèm",
        },
        {
          storeId,
          name: "Gia dụng",
          slug: "gia-dung",
          description: "Sản phẩm gia dụng",
        },
      ])
      .returning();

    insertedCategories.forEach((item) => {
      categoryMap.set(item.slug, item.id);
    });

    console.log("📂 Categories created:", insertedCategories.length);
  } else {
    existingCategories.forEach((item) => {
      categoryMap.set(item.slug, item.id);
    });

    console.log("📂 Categories already exist:", existingCategories.length);
  }

  const existingSuppliers = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.storeId, storeId));

  const supplierMap = new Map<string, string>();

  if (existingSuppliers.length === 0) {
    const insertedSuppliers = await db
      .insert(suppliers)
      .values([
        {
          storeId,
          name: "Công ty TNHH Tech Supply",
          phone: "0900000001",
          email: "techsupply@example.com",
          address: "Hà Nội",
          note: "Nhà cung cấp thiết bị điện tử",
        },
        {
          storeId,
          name: "Công ty Cổ phần Home Goods",
          phone: "0900000002",
          email: "homegoods@example.com",
          address: "TP.HCM",
          note: "Nhà cung cấp gia dụng",
        },
      ])
      .returning();

    insertedSuppliers.forEach((item) => {
      supplierMap.set(item.name, item.id);
    });

    console.log("🚚 Suppliers created:", insertedSuppliers.length);
  } else {
    existingSuppliers.forEach((item) => {
      supplierMap.set(item.name, item.id);
    });

    console.log("🚚 Suppliers already exist:", existingSuppliers.length);
  }

  const existingProducts = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId));

  if (existingProducts.length === 0) {
    const insertedProducts = await db
      .insert(products)
      .values([
        {
          storeId,
          categoryId: categoryMap.get("dien-tu") ?? null,
          sku: "SPK-BT-001",
          barcode: "893000000001",
          name: "Loa Bluetooth Mini",
          costPrice: "350000",
          salePrice: "490000",
          currentStock: 24,
          minStockAlert: 5,
          status: "active",
        },
        {
          storeId,
          categoryId: categoryMap.get("phu-kien") ?? null,
          sku: "CAP-USBC-001",
          barcode: "893000000002",
          name: "Cáp sạc USB-C 1m",
          costPrice: "45000",
          salePrice: "79000",
          currentStock: 120,
          minStockAlert: 20,
          status: "active",
        },
        {
          storeId,
          categoryId: categoryMap.get("gia-dung") ?? null,
          sku: "NM-SMART-001",
          barcode: "893000000003",
          name: "Nồi cơm điện mini",
          costPrice: "420000",
          salePrice: "590000",
          currentStock: 8,
          minStockAlert: 10,
          status: "active",
        },
        {
          storeId,
          categoryId: categoryMap.get("gia-dung") ?? null,
          sku: "MIX-HAND-001",
          barcode: "893000000004",
          name: "Máy đánh trứng cầm tay",
          costPrice: "280000",
          salePrice: "399000",
          currentStock: 0,
          minStockAlert: 5,
          status: "inactive",
        },
      ])
      .returning();

    console.log("📦 Products created:", insertedProducts.length);
  } else {
    console.log("📦 Products already exist:", existingProducts.length);
  }

  console.log("✅ Seed completed successfully");
  console.log("🆔 Demo storeId:", storeId);

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed");
  console.error(error);
  process.exit(1);
});
