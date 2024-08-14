/*
  Warnings:

  - You are about to drop the `category_products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `favorite_products` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "category_products" DROP CONSTRAINT "category_products_category_id_fkey";

-- DropForeignKey
ALTER TABLE "category_products" DROP CONSTRAINT "category_products_product_id_fkey";

-- DropForeignKey
ALTER TABLE "favorite_products" DROP CONSTRAINT "favorite_products_favorite_id_fkey";

-- DropForeignKey
ALTER TABLE "favorite_products" DROP CONSTRAINT "favorite_products_product_id_fkey";

-- DropTable
DROP TABLE "category_products";

-- DropTable
DROP TABLE "favorite_products";

-- CreateTable
CREATE TABLE "_CategoryToProduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_FavoriteToProduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToProduct_AB_unique" ON "_CategoryToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToProduct_B_index" ON "_CategoryToProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FavoriteToProduct_AB_unique" ON "_FavoriteToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_FavoriteToProduct_B_index" ON "_FavoriteToProduct"("B");

-- AddForeignKey
ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FavoriteToProduct" ADD CONSTRAINT "_FavoriteToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "favorites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FavoriteToProduct" ADD CONSTRAINT "_FavoriteToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
