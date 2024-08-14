/*
  Warnings:

  - You are about to drop the column `body` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `creator_id` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the `_CartToProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_lines` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[order_code]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[seller_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `content` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `link` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipient_id` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Made the column `creator_id` on table `notifications` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `custommer_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_code` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_price` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isPaid` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seller_id` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnail` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Made the column `creator_id` on table `tasks` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PROCESSING', 'CONFIRMED', 'DELIVERING', 'DELIVERED', 'RECEIVED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('TRANSFER', 'CASH');

-- AlterEnum
ALTER TYPE "TaskStatus" ADD VALUE 'NOT_INTERIOR';

-- DropForeignKey
ALTER TABLE "_CartToProduct" DROP CONSTRAINT "_CartToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_CartToProduct" DROP CONSTRAINT "_CartToProduct_B_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "order_lines" DROP CONSTRAINT "order_lines_orderId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_userId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_creator_id_fkey";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "body",
DROP COLUMN "status",
DROP COLUMN "user_id",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "link" TEXT NOT NULL,
ADD COLUMN     "recipient_id" INTEGER NOT NULL,
ALTER COLUMN "creator_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "totalPrice",
DROP COLUMN "userId",
ADD COLUMN     "custommer_id" INTEGER NOT NULL,
ADD COLUMN     "order_code" TEXT NOT NULL,
ADD COLUMN     "payment_type" "PaymentType" NOT NULL DEFAULT 'TRANSFER',
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PROCESSING',
ADD COLUMN     "total_price" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "amount",
DROP COLUMN "provider",
DROP COLUMN "status",
ADD COLUMN     "isPaid" BOOLEAN NOT NULL,
ADD COLUMN     "vnp_bank_code" TEXT,
ADD COLUMN     "vnp_bank_tran_no" TEXT,
ADD COLUMN     "vnp_card_type" TEXT,
ADD COLUMN     "vnp_order_info" TEXT,
ADD COLUMN     "vnp_pay_date" TIMESTAMP(3),
ADD COLUMN     "vnp_transaction_no" TEXT;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "creator_id",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "seller_id" INTEGER NOT NULL,
ADD COLUMN     "sold" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "thumbnail" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "reply" TEXT;

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "url",
ADD COLUMN     "prompt" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "urls" TEXT[],
ALTER COLUMN "creator_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "seller_id" INTEGER;

-- DropTable
DROP TABLE "_CartToProduct";

-- DropTable
DROP TABLE "order_lines";

-- DropEnum
DROP TYPE "NotificationStatus";

-- CreateTable
CREATE TABLE "sellers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "total_product" INTEGER NOT NULL DEFAULT 0,
    "total_sold" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_products" (
    "cart_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "cart_products_pkey" PRIMARY KEY ("cart_id","product_id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "notifications_creator_id_idx" ON "notifications"("creator_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_idx" ON "notifications"("recipient_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_code_key" ON "orders"("order_code");

-- CreateIndex
CREATE INDEX "orders_custommer_id_idx" ON "orders"("custommer_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "products_seller_id_idx" ON "products"("seller_id");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_price_idx" ON "products"("price");

-- CreateIndex
CREATE INDEX "products_avg_rating_idx" ON "products"("avg_rating");

-- CreateIndex
CREATE INDEX "reviews_creator_id_idx" ON "reviews"("creator_id");

-- CreateIndex
CREATE INDEX "reviews_product_id_idx" ON "reviews"("product_id");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "tasks_creator_id_idx" ON "tasks"("creator_id");

-- CreateIndex
CREATE INDEX "token_keys_user_id_idx" ON "token_keys"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_seller_id_key" ON "users"("seller_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "sellers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_products" ADD CONSTRAINT "cart_products_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_products" ADD CONSTRAINT "cart_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_custommer_id_fkey" FOREIGN KEY ("custommer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
