-- CreateTable
CREATE TABLE "ve_nguoidung" (
    "ve_id" SERIAL NOT NULL,
    "nguoidung_id" INTEGER NOT NULL,
    "tieu_de" VARCHAR(255) NOT NULL,
    "loai_ve" VARCHAR(50),
    "ngay_su_dung" DATE,
    "ghi_chu" TEXT,
    "file_url" TEXT,
    "kieu_file" VARCHAR(100),
    "cloudinary_id" VARCHAR(255),
    "trang_thai" BOOLEAN NOT NULL DEFAULT true,
    "ngaytao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ve_nguoidung_pkey" PRIMARY KEY ("ve_id")
);

-- CreateTable
CREATE TABLE "ve_diadiem_lichtrinh" (
    "id" SERIAL NOT NULL,
    "ve_id" INTEGER NOT NULL,
    "lichtrinh_nguoidung_diadiem_id" INTEGER NOT NULL,
    "ngaytao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ve_diadiem_lichtrinh_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ve_nguoidung" ADD CONSTRAINT "ve_nguoidung_nguoidung_id_fkey" FOREIGN KEY ("nguoidung_id") REFERENCES "nguoidung"("nguoidung_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ve_diadiem_lichtrinh" ADD CONSTRAINT "ve_diadiem_lichtrinh_ve_id_fkey" FOREIGN KEY ("ve_id") REFERENCES "ve_nguoidung"("ve_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ve_diadiem_lichtrinh" ADD CONSTRAINT "ve_diadiem_lichtrinh_lichtrinh_nguoidung_diadiem_id_fkey" FOREIGN KEY ("lichtrinh_nguoidung_diadiem_id") REFERENCES "lichtrinh_nguoidung_diadiem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
