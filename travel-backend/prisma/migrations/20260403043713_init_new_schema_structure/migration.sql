/*
  Warnings:

  - The primary key for the `lichtrinh_nguoidung_diadiem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `lichtrinh_nguoidung_diadiem_id` on the `lichtrinh_nguoidung_diadiem` table. All the data in the column will be lost.
  - The primary key for the `nguoidung_sothich` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `nguoidung_sothich_id` on the `nguoidung_sothich` table. All the data in the column will be lost.
  - You are about to drop the `lichtrinh_local` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lichtrinh_local_diadiem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `meovat_diadiem` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `ngay_thu_may` on table `tuyen_duong` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "chitiet_diadiem" DROP CONSTRAINT "chitiet_diadiem_diadiem_id_fkey";

-- DropForeignKey
ALTER TABLE "danhgia_diadiem" DROP CONSTRAINT "danhgia_diadiem_diadiem_id_fkey";

-- DropForeignKey
ALTER TABLE "danhgia_diadiem" DROP CONSTRAINT "danhgia_diadiem_nguoidung_id_fkey";

-- DropForeignKey
ALTER TABLE "hinhanh_diadiem" DROP CONSTRAINT "hinhanh_diadiem_diadiem_id_fkey";

-- DropForeignKey
ALTER TABLE "lichtrinh_local" DROP CONSTRAINT "lichtrinh_local_nguoidung_id_fkey";

-- DropForeignKey
ALTER TABLE "lichtrinh_local" DROP CONSTRAINT "lichtrinh_local_sothich_id_fkey";

-- DropForeignKey
ALTER TABLE "lichtrinh_local_diadiem" DROP CONSTRAINT "lichtrinh_local_diadiem_diadiem_id_fkey";

-- DropForeignKey
ALTER TABLE "lichtrinh_local_diadiem" DROP CONSTRAINT "lichtrinh_local_diadiem_lichtrinh_local_id_fkey";

-- DropForeignKey
ALTER TABLE "lichtrinh_nguoidung" DROP CONSTRAINT "lichtrinh_nguoidung_nguoidung_id_fkey";

-- DropForeignKey
ALTER TABLE "lichtrinh_nguoidung_diadiem" DROP CONSTRAINT "lichtrinh_nguoidung_diadiem_diadiem_id_fkey";

-- DropForeignKey
ALTER TABLE "lichtrinh_nguoidung_diadiem" DROP CONSTRAINT "lichtrinh_nguoidung_diadiem_lichtrinh_nguoidung_id_fkey";

-- DropForeignKey
ALTER TABLE "luu_diadiem" DROP CONSTRAINT "luu_diadiem_diadiem_id_fkey";

-- DropForeignKey
ALTER TABLE "luu_diadiem" DROP CONSTRAINT "luu_diadiem_nguoidung_id_fkey";

-- DropForeignKey
ALTER TABLE "meovat_diadiem" DROP CONSTRAINT "meovat_diadiem_diadiem_id_fkey";

-- DropForeignKey
ALTER TABLE "meovat_diadiem" DROP CONSTRAINT "meovat_diadiem_nguoidung_id_fkey";

-- DropForeignKey
ALTER TABLE "nguoidung_sothich" DROP CONSTRAINT "nguoidung_sothich_nguoidung_id_fkey";

-- DropForeignKey
ALTER TABLE "nguoidung_sothich" DROP CONSTRAINT "nguoidung_sothich_sothich_id_fkey";

-- DropForeignKey
ALTER TABLE "tuyen_duong" DROP CONSTRAINT "tuyen_duong_lichtrinh_nguoidung_id_fkey";

-- AlterTable
ALTER TABLE "diadiem" ADD COLUMN     "quan_huyen" VARCHAR(100),
ADD COLUMN     "tu_khoa" TEXT;

-- AlterTable
ALTER TABLE "lichtrinh_nguoidung_diadiem" DROP CONSTRAINT "lichtrinh_nguoidung_diadiem_pkey",
DROP COLUMN "lichtrinh_nguoidung_diadiem_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "ngay_thu_may" INTEGER NOT NULL DEFAULT 1,
ADD CONSTRAINT "lichtrinh_nguoidung_diadiem_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "nguoidung" ADD COLUMN     "vaitro" VARCHAR(20) NOT NULL DEFAULT 'user';

-- AlterTable
ALTER TABLE "nguoidung_sothich" DROP CONSTRAINT "nguoidung_sothich_pkey",
DROP COLUMN "nguoidung_sothich_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "nguoidung_sothich_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "tuyen_duong" ADD COLUMN     "diadiem_batdau_id" INTEGER,
ADD COLUMN     "diadiem_ketthuc_id" INTEGER,
ADD COLUMN     "phuongtien" VARCHAR(50) DEFAULT 'car',
ALTER COLUMN "ngay_thu_may" SET NOT NULL;

-- DropTable
DROP TABLE "lichtrinh_local";

-- DropTable
DROP TABLE "lichtrinh_local_diadiem";

-- DropTable
DROP TABLE "meovat_diadiem";

-- CreateTable
CREATE TABLE "hoatdong_diadiem" (
    "hoatdong_id" SERIAL NOT NULL,
    "diadiem_id" INTEGER,
    "nguoidung_id" INTEGER,
    "ten_hoatdong" VARCHAR(255) NOT NULL,
    "noidung_chitiet" TEXT,
    "loai_hoatdong" VARCHAR(50),
    "thoidiem_lytuong" VARCHAR(100),
    "gia_thamkhao" DECIMAL(12,2),
    "ngaytao" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hoatdong_diadiem_pkey" PRIMARY KEY ("hoatdong_id")
);

-- CreateTable
CREATE TABLE "lichtrinh_mau" (
    "lichtrinh_mau_id" SERIAL NOT NULL,
    "nguoidung_id" INTEGER,
    "tieude" VARCHAR(255) NOT NULL,
    "mota" TEXT,
    "sothich_id" INTEGER,
    "thoigian_dukien" VARCHAR(100),
    "luotthich" INTEGER DEFAULT 0,
    "ngaytao" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lichtrinh_mau_pkey" PRIMARY KEY ("lichtrinh_mau_id")
);

-- CreateTable
CREATE TABLE "lichtrinh_mau_diadiem" (
    "id" SERIAL NOT NULL,
    "lichtrinh_mau_id" INTEGER,
    "diadiem_id" INTEGER,
    "thutu" INTEGER,
    "ngay_thu_may" INTEGER NOT NULL DEFAULT 1,
    "thoigian_den" TIME(6),
    "thoiluong" INTEGER,
    "ghichu" TEXT,

    CONSTRAINT "lichtrinh_mau_diadiem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lichtrinh_hoatdong" (
    "id" SERIAL NOT NULL,
    "lichtrinh_nguoidung_id" INTEGER NOT NULL,
    "hoatdong_id" INTEGER NOT NULL,
    "da_hoan_thanh" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "lichtrinh_hoatdong_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chitiet_diadiem" ADD CONSTRAINT "chitiet_diadiem_diadiem_id_fkey" FOREIGN KEY ("diadiem_id") REFERENCES "diadiem"("diadiem_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoatdong_diadiem" ADD CONSTRAINT "hoatdong_diadiem_diadiem_id_fkey" FOREIGN KEY ("diadiem_id") REFERENCES "diadiem"("diadiem_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoatdong_diadiem" ADD CONSTRAINT "hoatdong_diadiem_nguoidung_id_fkey" FOREIGN KEY ("nguoidung_id") REFERENCES "nguoidung"("nguoidung_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lichtrinh_mau" ADD CONSTRAINT "lichtrinh_mau_nguoidung_id_fkey" FOREIGN KEY ("nguoidung_id") REFERENCES "nguoidung"("nguoidung_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lichtrinh_mau" ADD CONSTRAINT "lichtrinh_mau_sothich_id_fkey" FOREIGN KEY ("sothich_id") REFERENCES "sothich"("sothich_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lichtrinh_mau_diadiem" ADD CONSTRAINT "lichtrinh_mau_diadiem_diadiem_id_fkey" FOREIGN KEY ("diadiem_id") REFERENCES "diadiem"("diadiem_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lichtrinh_mau_diadiem" ADD CONSTRAINT "lichtrinh_mau_diadiem_lichtrinh_mau_id_fkey" FOREIGN KEY ("lichtrinh_mau_id") REFERENCES "lichtrinh_mau"("lichtrinh_mau_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lichtrinh_nguoidung" ADD CONSTRAINT "lichtrinh_nguoidung_nguoidung_id_fkey" FOREIGN KEY ("nguoidung_id") REFERENCES "nguoidung"("nguoidung_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lichtrinh_nguoidung_diadiem" ADD CONSTRAINT "lichtrinh_nguoidung_diadiem_diadiem_id_fkey" FOREIGN KEY ("diadiem_id") REFERENCES "diadiem"("diadiem_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lichtrinh_nguoidung_diadiem" ADD CONSTRAINT "lichtrinh_nguoidung_diadiem_lichtrinh_nguoidung_id_fkey" FOREIGN KEY ("lichtrinh_nguoidung_id") REFERENCES "lichtrinh_nguoidung"("lichtrinh_nguoidung_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tuyen_duong" ADD CONSTRAINT "tuyen_duong_lichtrinh_nguoidung_id_fkey" FOREIGN KEY ("lichtrinh_nguoidung_id") REFERENCES "lichtrinh_nguoidung"("lichtrinh_nguoidung_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lichtrinh_hoatdong" ADD CONSTRAINT "lichtrinh_hoatdong_hoatdong_id_fkey" FOREIGN KEY ("hoatdong_id") REFERENCES "hoatdong_diadiem"("hoatdong_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lichtrinh_hoatdong" ADD CONSTRAINT "lichtrinh_hoatdong_lichtrinh_nguoidung_id_fkey" FOREIGN KEY ("lichtrinh_nguoidung_id") REFERENCES "lichtrinh_nguoidung"("lichtrinh_nguoidung_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nguoidung_sothich" ADD CONSTRAINT "nguoidung_sothich_nguoidung_id_fkey" FOREIGN KEY ("nguoidung_id") REFERENCES "nguoidung"("nguoidung_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nguoidung_sothich" ADD CONSTRAINT "nguoidung_sothich_sothich_id_fkey" FOREIGN KEY ("sothich_id") REFERENCES "sothich"("sothich_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "danhgia_diadiem" ADD CONSTRAINT "danhgia_diadiem_diadiem_id_fkey" FOREIGN KEY ("diadiem_id") REFERENCES "diadiem"("diadiem_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "danhgia_diadiem" ADD CONSTRAINT "danhgia_diadiem_nguoidung_id_fkey" FOREIGN KEY ("nguoidung_id") REFERENCES "nguoidung"("nguoidung_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hinhanh_diadiem" ADD CONSTRAINT "hinhanh_diadiem_diadiem_id_fkey" FOREIGN KEY ("diadiem_id") REFERENCES "diadiem"("diadiem_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "luu_diadiem" ADD CONSTRAINT "luu_diadiem_diadiem_id_fkey" FOREIGN KEY ("diadiem_id") REFERENCES "diadiem"("diadiem_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "luu_diadiem" ADD CONSTRAINT "luu_diadiem_nguoidung_id_fkey" FOREIGN KEY ("nguoidung_id") REFERENCES "nguoidung"("nguoidung_id") ON DELETE CASCADE ON UPDATE CASCADE;
