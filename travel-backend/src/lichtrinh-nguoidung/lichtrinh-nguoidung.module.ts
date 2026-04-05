import { Module } from '@nestjs/common';
import { LichtrinhNguoidungService } from './lichtrinh-nguoidung.service';
import { LichtrinhNguoidungController } from './lichtrinh-nguoidung.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LichtrinhNguoidungService],
  controllers: [LichtrinhNguoidungController],
})
export class LichtrinhNguoidungModule {}
