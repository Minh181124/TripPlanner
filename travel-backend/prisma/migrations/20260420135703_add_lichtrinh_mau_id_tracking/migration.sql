-- AlterTable
ALTER TABLE "lichtrinh_mau" ADD COLUMN     "chi_phi_dukien" DECIMAL(12,2),
ADD COLUMN     "trang_thai" VARCHAR(20) DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE "lichtrinh_nguoidung" ADD COLUMN     "lichtrinh_mau_id" INTEGER;

-- CreateTable
CREATE TABLE "lichtrinh_mau_ngay" (
    "id" SERIAL NOT NULL,
    "lichtrinh_mau_id" INTEGER NOT NULL,
    "ngay_thu_may" INTEGER NOT NULL DEFAULT 1,
    "gio_batdau" VARCHAR(50),
    "diem_batdau_ten" VARCHAR(255),
    "diem_batdau_lat" DOUBLE PRECISION,
    "diem_batdau_lng" DOUBLE PRECISION,
    "diem_ketthuc_ten" VARCHAR(255),
    "diem_ketthuc_lat" DOUBLE PRECISION,
    "diem_ketthuc_lng" DOUBLE PRECISION,

    CONSTRAINT "lichtrinh_mau_ngay_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "lichtrinh_nguoidung" ADD CONSTRAINT "lichtrinh_nguoidung_lichtrinh_mau_id_fkey" FOREIGN KEY ("lichtrinh_mau_id") REFERENCES "lichtrinh_mau"("lichtrinh_mau_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lichtrinh_mau_ngay" ADD CONSTRAINT "lichtrinh_mau_ngay_lichtrinh_mau_id_fkey" FOREIGN KEY ("lichtrinh_mau_id") REFERENCES "lichtrinh_mau"("lichtrinh_mau_id") ON DELETE CASCADE ON UPDATE CASCADE;
