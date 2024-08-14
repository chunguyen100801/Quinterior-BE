/*
  Warnings:

  - You are about to drop the column `user_id` on the `carts` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cart_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creator_id` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "carts" DROP CONSTRAINT "carts_user_id_fkey";

-- AlterTable
ALTER TABLE "carts" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "category_id",
ADD COLUMN     "background" TEXT,
ADD COLUMN     "creator_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "cart_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "users_cart_id_key" ON "users"("cart_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
