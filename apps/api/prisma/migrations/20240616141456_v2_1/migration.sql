/*
  Warnings:

  - The values [DELIVERED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CASH] on the enum `PaymentType` will be removed. If these variants are still used in the database, this will fail.
  - The values [NOT_INTERIOR] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `slug` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `comment` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `isPaid` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `creator_id` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `urls` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `seller_id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[vnp_txn_ref]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order_item_id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `sellers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `seller_id` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seller_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_item_id` to the `reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `sellers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ModelType" AS ENUM ('FLOOR_ITEM', 'IN_WALL_ITEM', 'WALL_ITEM', 'DECORATE_ITEM', 'ROOF_ITEM');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PROCESSING', 'PAID', 'CONFIRMED', 'DELIVERING', 'RECEIVED', 'CANCELED');
ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PROCESSING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentType_new" AS ENUM ('TRANSFER');
ALTER TABLE "orders" ALTER COLUMN "payment_type" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "payment_type" TYPE "PaymentType_new" USING ("payment_type"::text::"PaymentType_new");
ALTER TYPE "PaymentType" RENAME TO "PaymentType_old";
ALTER TYPE "PaymentType_new" RENAME TO "PaymentType";
DROP TYPE "PaymentType_old";
ALTER TABLE "orders" ALTER COLUMN "payment_type" SET DEFAULT 'TRANSFER';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('QUEUE', 'PENDING', 'COMPLETE', 'FAILED', 'PROMPT_NOT_INTERIOR', 'IMAGE_NOT_INTERIOR');
ALTER TABLE "tasks" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "tasks" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "TaskStatus_old";
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'QUEUE';
COMMIT;

-- DropForeignKey
ALTER TABLE "cart_products" DROP CONSTRAINT "cart_products_cart_id_fkey";

-- DropForeignKey
ALTER TABLE "cart_products" DROP CONSTRAINT "cart_products_product_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_order_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_product_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_seller_id_fkey";

-- DropIndex
DROP INDEX "categories_slug_idx";

-- DropIndex
DROP INDEX "categories_slug_key";

-- DropIndex
DROP INDEX "payments_order_id_key";

-- DropIndex
DROP INDEX "reviews_product_id_idx";

-- DropIndex
DROP INDEX "tasks_creator_id_idx";

-- DropIndex
DROP INDEX "users_seller_id_key";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "slug",
ADD COLUMN     "seller_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "isRead",
ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "comment",
ADD COLUMN     "address_id" INTEGER NOT NULL,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "payment_id" INTEGER,
ADD COLUMN     "seller_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "isPaid",
DROP COLUMN "order_id",
ADD COLUMN     "is_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vnp_txn_ref" TEXT;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "model";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "product_id",
ADD COLUMN     "order_item_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "sellers" ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "logo" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "creator_id",
DROP COLUMN "urls",
ADD COLUMN     "url" TEXT,
ADD COLUMN     "workspace_id" INTEGER,
ALTER COLUMN "status" SET DEFAULT 'QUEUE';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "address",
DROP COLUMN "seller_id",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "files" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "path" TEXT,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "productModelId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_models" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "z" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "type" "ModelType" NOT NULL DEFAULT 'FLOOR_ITEM',

    CONSTRAINT "product_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" SERIAL NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "data" JSON,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_dailies" (
    "id" SERIAL NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "user_id" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_dailies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "files_key_key" ON "files"("key");

-- CreateIndex
CREATE UNIQUE INDEX "files_productModelId_key" ON "files"("productModelId");

-- CreateIndex
CREATE INDEX "files_key_idx" ON "files"("key");

-- CreateIndex
CREATE INDEX "files_creator_id_idx" ON "files"("creator_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_models_product_id_key" ON "product_models"("product_id");

-- CreateIndex
CREATE INDEX "credit_dailies_user_id_idx" ON "credit_dailies"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "credit_dailies_user_id_created_at_key" ON "credit_dailies"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "categories_seller_id_idx" ON "categories"("seller_id");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE INDEX "orders_payment_id_idx" ON "orders"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_vnp_txn_ref_key" ON "payments"("vnp_txn_ref");

-- CreateIndex
CREATE INDEX "payments_is_paid_idx" ON "payments"("is_paid");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_order_item_id_key" ON "reviews"("order_item_id");

-- CreateIndex
CREATE INDEX "reviews_order_item_id_idx" ON "reviews"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "sellers_user_id_key" ON "sellers"("user_id");

-- CreateIndex
CREATE INDEX "sellers_user_id_idx" ON "sellers"("user_id");

-- CreateIndex
CREATE INDEX "tasks_workspace_id_idx" ON "tasks"("workspace_id");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_productModelId_fkey" FOREIGN KEY ("productModelId") REFERENCES "product_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sellers" ADD CONSTRAINT "sellers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_models" ADD CONSTRAINT "product_models_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_products" ADD CONSTRAINT "cart_products_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_products" ADD CONSTRAINT "cart_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_dailies" ADD CONSTRAINT "credit_dailies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
