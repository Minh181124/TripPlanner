import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// 1. Khởi tạo Adapter đúng cách để tránh lỗi InitializationError
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ==========================================
  // 1. DỌN DẸP DỮ LIỆU CŨ (Clean Room)
  // ==========================================
  console.log('⏳ Đang dọn dẹp dữ liệu cũ...');
  await prisma.lichtrinh_hoatdong.deleteMany();
  await prisma.tuyen_duong.deleteMany();
  await prisma.lichtrinh_nguoidung_diadiem.deleteMany();
  await prisma.lichtrinh_nguoidung.deleteMany();
  await prisma.lichtrinh_mau_diadiem.deleteMany();
  await prisma.lichtrinh_mau.deleteMany();
  await prisma.hoatdong_diadiem.deleteMany();
  await prisma.chitiet_diadiem.deleteMany(); // Đã thêm
  await prisma.nguoidung_sothich.deleteMany();
  await prisma.diadiem.deleteMany();
  await prisma.sothich.deleteMany();
  await prisma.nguoidung.deleteMany();

  const saltRounds = 10;
  const hashPassword = await bcrypt.hash('123456', saltRounds);

  // ==========================================
  // 2. TẠO NGƯỜI DÙNG (3 Actors)
  // ==========================================
  console.log('👤 Đang tạo người dùng...');
  const admin = await prisma.nguoidung.create({
    data: {
      email: 'admin@travel.com',
      matkhau: hashPassword,
      ten: 'Quản trị viên',
      vaitro: 'admin',
    },
  });

  const local = await prisma.nguoidung.create({
    data: {
      email: 'local@travel.com',
      matkhau: hashPassword,
      ten: 'Minh Local Guide',
      vaitro: 'local',
    },
  });

  const user = await prisma.nguoidung.create({
    data: {
      email: 'user@travel.com',
      matkhau: hashPassword,
      ten: 'Khách du lịch',
      vaitro: 'user',
    },
  });

  // ==========================================
  // 3. TẠO SỞ THÍCH
  // ==========================================
  console.log('🌈 Đang tạo sở thích...');
  const chill = await prisma.sothich.create({ data: { ten: 'Chill', mota: 'Thư giãn, nhẹ nhàng' } });
  const food = await prisma.sothich.create({ data: { ten: 'Ẩm thực', mota: 'Khám phá đồ ăn địa phương' } });
  const history = await prisma.sothich.create({ data: { ten: 'Lịch sử', mota: 'Bảo tàng, di tích' } });

  // ==========================================
  // 4. TẠO ĐỊA ĐIỂM (Master Data)
  // ==========================================
  console.log('📍 Đang tạo địa điểm và chi tiết...');
  
  // Địa điểm 1: Bitexco
  const bitexco = await prisma.diadiem.create({
    data: {
      google_place_id: 'mapbox-id-bitexco',
      ten: 'Tòa nhà Bitexco',
      diachi: '2 Hải Triều, Bến Nghé, Quận 1, TP.HCM',
      quan_huyen: 'Quận 1',
      tu_khoa: 'ngắm cảnh, tòa nhà, trung tâm',
      lat: 10.7715,
      lng: 106.7042,
      loai: 'Tham quan',
    },
  });

  await prisma.chitiet_diadiem.create({
    data: {
      diadiem_id: bitexco.diadiem_id,
      mota_tonghop: 'Tòa nhà biểu tượng hình búp sen của Sài Gòn.',
      website: 'https://bitexcofinancialtower.com',
    }
  });

  // Địa điểm 2: Nhà thờ Đức Bà (Dữ liệu từ file seed 2)
  const ducba = await prisma.diadiem.create({
    data: {
      google_place_id: 'hcm_church_001',
      ten: 'Nhà thờ Đức Bà Sài Gòn',
      diachi: '01 Công xã Paris, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      quan_huyen: 'Quận 1',
      tu_khoa: 'nhà thờ, kiến trúc pháp, trung tâm',
      lat: 10.779785,
      lng: 106.699019,
      loai: 'Tham quan',
    },
  });

  await prisma.chitiet_diadiem.create({
    data: {
      diadiem_id: ducba.diadiem_id,
      mota_tonghop: 'Biểu tượng công giáo của thành phố, kiến trúc Pháp cổ.',
    }
  });

  // Địa điểm 3: Phở Bà Chung
  const phobachung = await prisma.diadiem.create({
    data: {
      google_place_id: 'mapbox-id-phobachung',
      ten: 'Phở Bà Chung',
      diachi: 'Đường Pasteur, Quận 1, TP.HCM',
      quan_huyen: 'Quận 1',
      tu_khoa: 'ăn sáng, phở, truyền thống',
      lat: 10.7750,
      lng: 106.7000,
      loai: 'Ẩm thực',
    },
  });

  // ==========================================
  // 5. TẠO HOẠT ĐỘNG TẠI ĐỊA ĐIỂM
  // ==========================================
  const actBitexco = await prisma.hoatdong_diadiem.create({
    data: {
      diadiem_id: bitexco.diadiem_id,
      nguoidung_id: local.nguoidung_id,
      ten_hoatdong: 'Ngắm Sài Gòn từ Skydeck',
      noidung_chitiet: 'Trải nghiệm thang máy tốc độ cao lên tầng 49.',
      loai_hoatdong: 'Trải nghiệm',
      thoidiem_lytuong: '18:00 - 19:00',
    }
  });

  // ==========================================
  // 6. TẠO LỊCH TRÌNH MẪU (Template)
  // ==========================================
  const tourQ1 = await prisma.lichtrinh_mau.create({
    data: {
      tieude: 'Sài Gòn kiến trúc & ánh đèn',
      mota: 'Khám phá các biểu tượng của Quận 1',
      nguoidung_id: local.nguoidung_id,
      sothich_id: chill.sothich_id,
      thoigian_dukien: '1 ngày',
    },
  });

  await prisma.lichtrinh_mau_diadiem.createMany({
    data: [
      { lichtrinh_mau_id: tourQ1.lichtrinh_mau_id, diadiem_id: phobachung.diadiem_id, thutu: 1, ngay_thu_may: 1, ghichu: 'Ăn sáng nạp năng lượng.' },
      { lichtrinh_mau_id: tourQ1.lichtrinh_mau_id, diadiem_id: bitexco.diadiem_id, thutu: 2, ngay_thu_may: 1, ghichu: 'Tham quan tòa nhà biểu tượng.' },
    ],
  });

  // ==========================================
  // 7. TẠO LỊCH TRÌNH NGƯỜI DÙNG (Personal)
  // ==========================================
  console.log('📅 Đang tạo lịch trình thực tế cho khách...');
  const userTrip = await prisma.lichtrinh_nguoidung.create({
    data: {
      nguoidung_id: user.nguoidung_id,
      tieude: 'Du lịch lễ 30/04',
      ngaybatdau: new Date('2026-04-30'),
      ngayketthuc: new Date('2026-05-02'),
      trangthai: 'planning',
    }
  });

  await prisma.lichtrinh_nguoidung_diadiem.create({
    data: {
      lichtrinh_nguoidung_id: userTrip.lichtrinh_nguoidung_id,
      diadiem_id: phobachung.diadiem_id,
      thutu: 1,
      ngay_thu_may: 1,
    }
  });

  // ==========================================
  // 8. TUYẾN ĐƯỜNG & CHECK-LIST
  // ==========================================
  await prisma.tuyen_duong.create({
    data: {
      lichtrinh_nguoidung_id: userTrip.lichtrinh_nguoidung_id,
      diadiem_batdau_id: phobachung.diadiem_id,
      diadiem_ketthuc_id: bitexco.diadiem_id,
      polyline: 'e~p`Akv_jS_C?_C?uD?yD?',
      phuongtien: 'bike',
      tong_khoangcach: 1200,
      tong_thoigian: 420,
      ngay_thu_may: 1,
    }
  });

  await prisma.lichtrinh_hoatdong.create({
    data: {
      lichtrinh_nguoidung_id: userTrip.lichtrinh_nguoidung_id,
      hoatdong_id: actBitexco.hoatdong_id,
      da_hoan_thanh: false,
    }
  });

  console.log('✅ Đã seed dữ liệu thành công!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Đóng kết nối pool để kết thúc script hoàn toàn
  });