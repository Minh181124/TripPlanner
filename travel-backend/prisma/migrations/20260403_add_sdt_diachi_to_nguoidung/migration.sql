-- AddColumn sdt and diachi to nguoidung table
ALTER TABLE "public"."nguoidung" ADD COLUMN "sdt" character varying(20),
ADD COLUMN "diachi" text;
