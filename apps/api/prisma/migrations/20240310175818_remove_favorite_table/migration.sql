/*
  Warnings:

  - The `images` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `_FavoriteToProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `favorites` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_FavoriteToProduct" DROP CONSTRAINT "_FavoriteToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_FavoriteToProduct" DROP CONSTRAINT "_FavoriteToProduct_B_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_user_id_fkey";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "avg_rating" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_rating" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "images",
ADD COLUMN     "images" TEXT[];

-- DropTable
DROP TABLE "_FavoriteToProduct";

-- DropTable
DROP TABLE "favorites";
