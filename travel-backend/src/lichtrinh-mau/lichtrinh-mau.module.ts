import { Module } from '@nestjs/common';
import { LichtrinhMauService } from './lichtrinh-mau.service';
import { LichtrinhMauController } from './lichtrinh-mau.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LichtrinhMauService],
  controllers: [LichtrinhMauController],
})
export class LichtrinhMauModule {}
