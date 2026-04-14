import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PlacesModule } from './places/places.module';
import { LichtrinhMauModule } from './lichtrinh-mau/lichtrinh-mau.module';
import { LichtrinhNguoidungModule } from './lichtrinh-nguoidung/lichtrinh-nguoidung.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MapModule } from './map/map.module';
import { VeModule } from './ve/ve.module';

@Module({
  imports: [
    PrismaModule, // Module quản lý DB của bạn
    AuthModule, // Xác thực & Phân quyền
    UsersModule, // Quản lý hồ sơ người dùng & admin
    PlacesModule, // Tìm kiếm địa điểm và tuyến đường
    MapModule, // Hybrid search & place details (NEW)
    LichtrinhMauModule, // Lịch trình mẫu (Template) công khai
    LichtrinhNguoidungModule, // Lịch trình cá nhân (Personal Trip)
    VeModule, // Kho vé (Ticket Library)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
