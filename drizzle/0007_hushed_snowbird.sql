ALTER TABLE "products" ADD COLUMN "variants" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "sales_order_items" ADD COLUMN "selected_variants" jsonb DEFAULT '[]'::jsonb NOT NULL;
