import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, matkhau, ten, avatar } = registerDto;

    // Mật khẩu sẽ được hash trước. Nếu email đã tồn tại, Prisma sẽ ném lỗi P2002.
    // Lỗi P2002 này sẽ được HttpExceptionFilter bắt và trả về mã 409 Conflict.

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(matkhau, 10);

    // Tạo người dùng mới
    const user = await this.prisma.nguoidung.create({
      data: {
        email,
        matkhau: hashedPassword,
        ten,
        avatar: avatar || null,
        vaitro: 'user', // Mặc định là user
        trangthai: 'active',
      },
    });

    // Tạo JWT Token
    const token = this.generateToken(user.nguoidung_id, user.email, user.vaitro);

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: 86400, // 24 giờ
      user: {
        nguoidung_id: user.nguoidung_id,
        email: user.email,
        ten: user.ten || '',
        avatar: user.avatar,
        vaitro: user.vaitro,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, matkhau } = loginDto;

    // Tìm người dùng bằng email
    const user = await this.prisma.nguoidung.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(matkhau, user.matkhau);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // Kiểm tra trạng thái người dùng
    if (user.trangthai !== 'active') {
      throw new UnauthorizedException('Tài khoản này đã bị vô hiệu hóa');
    }

    // Tạo JWT Token
    const token = this.generateToken(user.nguoidung_id, user.email, user.vaitro);

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: 86400, // 24 giờ
      user: {
        nguoidung_id: user.nguoidung_id,
        email: user.email,
        ten: user.ten || '',
        avatar: user.avatar,
        vaitro: user.vaitro,
      },
    };
  }

  /**
   * Validate JWT Token và trả về thông tin người dùng
   */
  async validateToken(payload: JwtPayload) {
    const user = await this.prisma.nguoidung.findUnique({
      where: { nguoidung_id: payload.sub },
    });

    if (!user || user.trangthai !== 'active') {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    return user;
  }

  /**
   * Tạo JWT Token
   */
  private generateToken(userId: number, email: string, vaitro: string): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
      vaitro,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      expiresIn: '24h',
    });
  }
}
