CREATE TABLE "inventory_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"code_no" bigserial NOT NULL,
	"status" text DEFAULT 'balanced' NOT NULL,
	"note" text,
	"actual_quantity_total" integer DEFAULT 0 NOT NULL,
	"actual_value_total" numeric(14, 2) DEFAULT '0' NOT NULL,
	"total_diff_quantity" integer DEFAULT 0 NOT NULL,
	"increase_diff_quantity" integer DEFAULT 0 NOT NULL,
	"decrease_diff_quantity" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"balanced_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"balanced_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_checks_code_no_unique" UNIQUE("code_no")
);
--> statement-breakpoint
CREATE TABLE "inventory_check_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"check_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"product_name" text NOT NULL,
	"book_stock" integer NOT NULL,
	"actual_stock" integer NOT NULL,
	"diff_quantity" integer NOT NULL,
	"unit_cost" numeric(12, 2) DEFAULT '0' NOT NULL,
	"diff_value" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_checks" ADD CONSTRAINT "inventory_checks_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_checks" ADD CONSTRAINT "inventory_checks_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_checks" ADD CONSTRAINT "inventory_checks_balanced_by_profiles_id_fk" FOREIGN KEY ("balanced_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_check_items" ADD CONSTRAINT "inventory_check_items_check_id_inventory_checks_id_fk" FOREIGN KEY ("check_id") REFERENCES "public"."inventory_checks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_check_items" ADD CONSTRAINT "inventory_check_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;