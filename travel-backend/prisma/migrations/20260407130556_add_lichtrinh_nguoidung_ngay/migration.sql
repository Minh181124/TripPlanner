-- CreateTable
CREATE TABLE "lichtrinh_nguoidung_ngay" (
    "id" SERIAL NOT NULL,
    "lichtrinh_nguoidung_id" INTEGER NOT NULL,
    "ngay_thu_may" INTEGER NOT NULL DEFAULT 1,
    "gio_batdau" VARCHAR(50),
    "diem_batdau_ten" VARCHAR(255),
    "diem_batdau_lat" DOUBLE PRECISION,
    "diem_batdau_lng" DOUBLE PRECISION,
    "diem_ketthuc_ten" VARCHAR(255),
    "diem_ketthuc_lat" DOUBLE PRECISION,
    "diem_ketthuc_lng" DOUBLE PRECISION,

    CONSTRAINT "lichtrinh_nguoidung_ngay_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "lichtrinh_nguoidung_ngay" ADD CONSTRAINT "lichtrinh_nguoidung_ngay_lichtrinh_nguoidung_id_fkey" FOREIGN KEY ("lichtrinh_nguoidung_id") REFERENCES "lichtrinh_nguoidung"("lichtrinh_nguoidung_id") ON DELETE CASCADE ON UPDATE CASCADE;
