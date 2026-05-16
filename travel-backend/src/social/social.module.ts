import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { InteractionController } from './interaction.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PostController, InteractionController],
  providers: [PostService],
  exports: [PostService],
})
export class SocialModule {}
