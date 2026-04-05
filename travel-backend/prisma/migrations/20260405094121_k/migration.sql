/*
  Warnings:

  - You are about to drop the column `thoigian_batdau` on the `lichtrinh_nguoidung` table. All the data in the column will be lost.
  - You are about to drop the column `thoigian_ketthuc` on the `lichtrinh_nguoidung` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "diadiem" ADD COLUMN     "nguoidung_id" INTEGER,
ADD COLUMN     "trang_thai" VARCHAR(20) DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE "lichtrinh_nguoidung" DROP COLUMN "thoigian_batdau",
DROP COLUMN "thoigian_ketthuc",
ADD COLUMN     "ngaybatdau" DATE,
ADD COLUMN     "ngayketthuc" DATE;

-- AddForeignKey
ALTER TABLE "diadiem" ADD CONSTRAINT "diadiem_nguoidung_id_fkey" FOREIGN KEY ("nguoidung_id") REFERENCES "nguoidung"("nguoidung_id") ON DELETE SET NULL ON UPDATE CASCADE;
