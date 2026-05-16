import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async createPost(userId: number, itineraryId: number, data: { tieude: string; noidung?: string; hinhanh_cover?: string }) {
    // Check if itinerary exists and belongs to user
    const itinerary = await this.prisma.lichtrinh_nguoidung.findUnique({
      where: { lichtrinh_nguoidung_id: itineraryId },
    });

    if (!itinerary || itinerary.nguoidung_id !== userId) {
      throw new NotFoundException('Lịch trình không tồn tại hoặc không thuộc quyền sở hữu của bạn');
    }

    // Check if post already exists for this itinerary
    const existingPost = await this.prisma.baiviet.findUnique({
      where: { lichtrinh_nguoidung_id: itineraryId },
    });

    if (existingPost) {
      throw new ConflictException('Lịch trình này đã được chia sẻ rồi');
    }

    return this.prisma.baiviet.create({
      data: {
        tieude: data.tieude,
        noidung: data.noidung,
        hinhanh_cover: data.hinhanh_cover,
        trangthai_lichtrinh: itinerary.trangthai || 'planning',
        nguoidung_id: userId,
        lichtrinh_nguoidung_id: itineraryId,
      },
      include: {
        nguoidung: {
          select: {
            ten: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getPosts(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [posts, total] = await Promise.all([
      this.prisma.baiviet.findMany({
        skip,
        take: limit,
        orderBy: { ngaytao: 'desc' },
        include: {
          nguoidung: {
            select: {
              ten: true,
              avatar: true,
            },
          },
          lichtrinh: {
            include: {
              lichtrinh_nguoidung_diadiem: {
                include: {
                  diadiem: true,
                },
                orderBy: { thutu: 'asc' },
              },
              tuyen_duong: true,
            },
          },
          _count: {
            select: {
              tuongtac: true,
              binhluan: true,
            },
          },
        },
      }),
      this.prisma.baiviet.count(),
    ]);

    return {
      data: posts,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async getPostById(id: number) {
    const post = await this.prisma.baiviet.findUnique({
      where: { baiviet_id: id },
      include: {
        nguoidung: {
          select: {
            ten: true,
            avatar: true,
          },
        },
        lichtrinh: {
          include: {
            lichtrinh_nguoidung_diadiem: {
              include: {
                diadiem: true,
              },
              orderBy: { thutu: 'asc' },
            },
            tuyen_duong: true,
          },
        },
        binhluan: {
          include: {
            nguoidung: {
              select: {
                ten: true,
                avatar: true,
              },
            },
          },
          orderBy: { ngaytao: 'asc' },
        },
      },
    });

    if (!post) throw new NotFoundException('Bài viết không tồn tại');
    return post;
  }

  async toggleLike(postId: number, userId: number) {
    const existingLike = await this.prisma.tuongtac.findFirst({
      where: { baiviet_id: postId, nguoidung_id: userId },
    });

    if (existingLike) {
      await this.prisma.tuongtac.delete({
        where: { tuongtac_id: existingLike.tuongtac_id },
      });
      return { liked: false };
    } else {
      await this.prisma.tuongtac.create({
        data: {
          baiviet_id: postId,
          nguoidung_id: userId,
        },
      });
      return { liked: true };
    }
  }

  async addComment(postId: number, userId: number, noidung: string) {
    return this.prisma.binhluan.create({
      data: {
        baiviet_id: postId,
        nguoidung_id: userId,
        noidung,
      },
      include: {
        nguoidung: {
          select: { ten: true, avatar: true },
        },
      },
    });
  }

  async getComments(postId: number) {
    return this.prisma.binhluan.findMany({
      where: { baiviet_id: postId },
      include: {
        nguoidung: {
          select: { ten: true, avatar: true },
        },
      },
      orderBy: { ngaytao: 'desc' },
    });
  }

  async cloneItinerary(postId: number, userId: number) {
    const post = await this.prisma.baiviet.findUnique({
      where: { baiviet_id: postId },
      include: {
        lichtrinh: {
          include: {
            lichtrinh_nguoidung_diadiem: true,
            tuyen_duong: true,
          },
        },
      },
    });

    if (!post || !post.lichtrinh) {
      throw new NotFoundException('Lịch trình nguồn không tồn tại');
    }

    const source = post.lichtrinh;

    // 1. Create new Itinerary
    const newItinerary = await this.prisma.lichtrinh_nguoidung.create({
      data: {
        tieude: `${source.tieude} (Clone)`,
        ngaybatdau: source.ngaybatdau,
        trangthai: 'planning',
        nguoidung_id: userId,
      },
    });

    // 2. Clone Places
    if (source.lichtrinh_nguoidung_diadiem.length > 0) {
      await this.prisma.lichtrinh_nguoidung_diadiem.createMany({
        data: source.lichtrinh_nguoidung_diadiem.map((item) => ({
          lichtrinh_nguoidung_id: newItinerary.lichtrinh_nguoidung_id,
          diadiem_id: item.diadiem_id,
          thutu: item.thutu,
          thoigian_den: item.thoigian_den,
          thoiluong: item.thoiluong,
          ghichu: item.ghichu,
          ngay_thu_may: item.ngay_thu_may,
        })),
      });
    }

    // 3. Clone Routes
    if (source.tuyen_duong.length > 0) {
      await this.prisma.tuyen_duong.createMany({
        data: source.tuyen_duong.map((route) => ({
          lichtrinh_nguoidung_id: newItinerary.lichtrinh_nguoidung_id,
          diadiem_batdau_id: route.diadiem_batdau_id,
          diadiem_ketthuc_id: route.diadiem_ketthuc_id,
          tong_khoangcach: route.tong_khoangcach,
          tong_thoigian: route.tong_thoigian,
          polyline: route.polyline,
          ngay_thu_may: route.ngay_thu_may,
          phuongtien: route.phuongtien,
          thutu: route.thutu,
        })),
      });
    }

    return newItinerary;
  }
}
