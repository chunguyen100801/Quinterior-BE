/*
  Warnings:

  - You are about to drop the column `created_by_id` on the `carts` table. All the data in the column will be lost.
  - You are about to drop the `cart_items` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_id` to the `carts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_cart_id_fkey";

-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "carts" DROP CONSTRAINT "carts_created_by_id_fkey";

-- AlterTable
ALTER TABLE "carts" DROP COLUMN "created_by_id",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "cart_items";

-- CreateTable
CREATE TABLE "_CartToProduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CartToProduct_AB_unique" ON "_CartToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_CartToProduct_B_index" ON "_CartToProduct"("B");

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartToProduct" ADD CONSTRAINT "_CartToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartToProduct" ADD CONSTRAINT "_CartToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
