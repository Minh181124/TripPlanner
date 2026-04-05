-- AlterTable
ALTER TABLE "lichtrinh_mau" ADD COLUMN     "tong_khoangcach" DECIMAL,
ADD COLUMN     "tong_thoigian" INTEGER;

-- AlterTable
ALTER TABLE "tuyen_duong" ADD COLUMN     "thutu" INTEGER;

-- CreateTable
CREATE TABLE "tuyen_duong_mau" (
    "tuyen_duong_mau_id" SERIAL NOT NULL,
    "lichtrinh_mau_id" INTEGER,
    "diadiem_batdau_id" INTEGER,
    "diadiem_ketthuc_id" INTEGER,
    "polyline" TEXT,
    "phuongtien" VARCHAR(50) DEFAULT 'car',
    "tong_khoangcach" DECIMAL,
    "tong_thoigian" INTEGER,
    "ngay_thu_may" INTEGER NOT NULL DEFAULT 1,
    "thutu" INTEGER,
    "ngaytao" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tuyen_duong_mau_pkey" PRIMARY KEY ("tuyen_duong_mau_id")
);

-- AddForeignKey
ALTER TABLE "tuyen_duong_mau" ADD CONSTRAINT "tuyen_duong_mau_lichtrinh_mau_id_fkey" FOREIGN KEY ("lichtrinh_mau_id") REFERENCES "lichtrinh_mau"("lichtrinh_mau_id") ON DELETE CASCADE ON UPDATE CASCADE;
