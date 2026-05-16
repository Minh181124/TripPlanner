import { Controller, Post, Get, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req,
    @Body() createPostDto: { itineraryId: number; tieude: string; noidung?: string; hinhanh_cover?: string }
  ) {
    return this.postService.createPost(req.user.userId, createPostDto.itineraryId, createPostDto);
  }

  @Get()
  async findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return this.postService.getPosts(+page, +limit);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.getPostById(id);
  }
}
