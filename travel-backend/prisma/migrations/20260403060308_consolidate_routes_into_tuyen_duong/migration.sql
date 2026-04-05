/*
  Warnings:

  - You are about to drop the `tuyen_duong_mau` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tuyen_duong_mau" DROP CONSTRAINT "tuyen_duong_mau_lichtrinh_mau_id_fkey";

-- AlterTable
ALTER TABLE "tuyen_duong" ADD COLUMN     "lichtrinh_mau_id" INTEGER;

-- DropTable
DROP TABLE "tuyen_duong_mau";

-- AddForeignKey
ALTER TABLE "tuyen_duong" ADD CONSTRAINT "tuyen_duong_lichtrinh_mau_id_fkey" FOREIGN KEY ("lichtrinh_mau_id") REFERENCES "lichtrinh_mau"("lichtrinh_mau_id") ON DELETE CASCADE ON UPDATE CASCADE;
