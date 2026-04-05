CREATE INDEX "inventory_checks_store_id_idx" ON "inventory_checks" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "inventory_checks_created_at_idx" ON "inventory_checks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "inventory_check_items_check_id_idx" ON "inventory_check_items" USING btree ("check_id");--> statement-breakpoint
CREATE INDEX "inventory_check_items_product_id_idx" ON "inventory_check_items" USING btree ("product_id");