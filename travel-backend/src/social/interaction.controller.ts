import { 
  Controller, 
  Post, 
  Param, 
  Body, 
  UseGuards, 
  Request, 
  Delete, 
  ParseIntPipe,
  Get
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Social Interaction')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('posts')
export class InteractionController {
  constructor(private readonly postService: PostService) {}

  @Post(':id/like')
  @ApiOperation({ summary: 'Thích hoặc bỏ thích bài viết' })
  async toggleLike(@Param('id', ParseIntPipe) postId: number, @Request() req) {
    return this.postService.toggleLike(postId, req.user.nguoidung_id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Thêm bình luận mới' })
  async addComment(
    @Param('id', ParseIntPipe) postId: number,
    @Body('noidung') noidung: string,
    @Request() req
  ) {
    return this.postService.addComment(postId, req.user.nguoidung_id, noidung);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Lấy danh sách bình luận của bài viết' })
  async getComments(@Param('id', ParseIntPipe) postId: number) {
    return this.postService.getComments(postId);
  }

  @Post(':id/clone')
  @ApiOperation({ summary: 'Sao chép lịch trình từ bài viết này về kho cá nhân' })
  async cloneItinerary(@Param('id', ParseIntPipe) postId: number, @Request() req) {
    return this.postService.cloneItinerary(postId, req.user.nguoidung_id);
  }
}
