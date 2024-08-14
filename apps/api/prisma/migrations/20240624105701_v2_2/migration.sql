-- DropIndex
DROP INDEX "order_items_order_id_idx";

-- DropIndex
DROP INDEX "order_items_product_id_idx";

-- CreateIndex
CREATE INDEX "addresses_user_id_idx" ON "addresses"("user_id");

-- CreateIndex
CREATE INDEX "order_items_order_id_product_id_idx" ON "order_items"("order_id", "product_id");
