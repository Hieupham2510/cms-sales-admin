CREATE TABLE "profile_store_access" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profile_store_access" ADD CONSTRAINT "profile_store_access_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "profile_store_access" ADD CONSTRAINT "profile_store_access_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "profile_store_access_profile_store_uidx" ON "profile_store_access" USING btree ("profile_id","store_id");
--> statement-breakpoint
CREATE INDEX "profile_store_access_profile_id_idx" ON "profile_store_access" USING btree ("profile_id");
--> statement-breakpoint
CREATE INDEX "profile_store_access_store_id_idx" ON "profile_store_access" USING btree ("store_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "profile_store_access_profile_default_uidx" ON "profile_store_access" USING btree ("profile_id") WHERE "profile_store_access"."is_default" = true;
--> statement-breakpoint
INSERT INTO "profile_store_access" ("profile_id", "store_id", "is_default")
SELECT
  p."id",
  first_store."id",
  true
FROM "profiles" p
CROSS JOIN LATERAL (
  SELECT s."id"
  FROM "stores" s
  ORDER BY s."created_at" ASC
  LIMIT 1
) first_store
WHERE p."role" IN ('manager', 'staff')
  AND NOT EXISTS (
    SELECT 1
    FROM "profile_store_access" psa
    WHERE psa."profile_id" = p."id"
  );
