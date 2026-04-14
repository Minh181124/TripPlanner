import { Module } from '@nestjs/common';
import { VeController } from './ve.controller';
import { VeService } from './ve.service';
import { CloudinaryService } from './cloudinary.service';
import { GeminiService } from './gemini.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VeController],
  providers: [VeService, CloudinaryService, GeminiService],
  exports: [VeService],
})
export class VeModule {}
