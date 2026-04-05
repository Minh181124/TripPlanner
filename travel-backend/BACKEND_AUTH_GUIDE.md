# 🔐 Backend Auth API Implementation Guide

## Overview

This guide provides the specification for implementing the authentication endpoints that support the frontend Auth Context and Layout system.

## Required Endpoints

### 1. Login Endpoint

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates user with email and password, returns user data and JWT token.

**Request Body:**
```json
{
  "email": "user@travel.com",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "nguoidung_id": 1,
      "email": "user@travel.com",
      "ten": "Nguyễn Văn A",
      "avatar": "https://avatars.example.com/user1.jpg",
      "vaitro": "user",
      "trangthai": "active",
      "ngaytao": "2025-01-01T10:30:00Z",
      "ngaycapnhat": "2025-01-15T14:20:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response (Error - 401):**
```json
{
  "message": "Email hoặc mật khẩu không đúng",
  "error": "INVALID_CREDENTIALS"
}
```

**Error Cases:**
- 400: Missing email or password
- 401: Invalid email/password
- 429: Too many login attempts

### 2. Get Current User Endpoint

**Endpoint:** `GET /api/auth/me`

**Description:** Returns the current authenticated user's information.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success - 200):**
```json
{
  "message": "Success",
  "data": {
    "nguoidung_id": 1,
    "email": "user@travel.com",
    "ten": "Nguyễn Văn A",
    "avatar": "https://avatars.example.com/user1.jpg",
    "vaitro": "user",
    "trangthai": "active",
    "ngaytao": "2025-01-01T10:30:00Z",
    "ngaycapnhat": "2025-01-15T14:20:00Z"
  }
}
```

**Response (Error - 401):**
```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn",
  "error": "UNAUTHORIZED"
}
```

**Error Cases:**
- 401: Missing or invalid token
- 401: Token expired
- 404: User not found

### 3. Logout Endpoint (Optional)

**Endpoint:** `POST /api/auth/logout`

**Description:** Logs out the current user (useful for server-side invalidation).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success - 200):**
```json
{
  "message": "Đăng xuất thành công"
}
```

## Implementation Details

### NestJS Auth Module Structure

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### AuthService Implementation

```typescript
// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    // Find user by email
    const user = await this.prisma.nguoidung.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.mat_khau);
    if (!isValidPassword) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.nguoidung_id,
      email: user.email,
    });

    return {
      user: this.formatUser(user),
      token,
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }

  async getCurrentUser(userId: number) {
    const user = await this.prisma.nguoidung.findUniqueOrThrow({
      where: { nguoidung_id: userId },
    });

    return this.formatUser(user);
  }

  private formatUser(user: any) {
    return {
      nguoidung_id: user.nguoidung_id,
      email: user.email,
      ten: user.ten,
      avatar: user.avatar,
      vaitro: user.vaitro,
      trangthai: user.trangthai,
      ngaytao: user.ngaytao,
      ngaycapnhat: user.ngaycapnhat,
    };
  }
}
```

### AuthController Implementation

```typescript
// src/auth/auth.controller.ts
import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    return {
      message: 'Đăng nhập thành công',
      data: result,
    };
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async getCurrentUser(@Request() req) {
    const user = await this.authService.getCurrentUser(req.user.sub);
    return {
      message: 'Success',
      data: user,
    };
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  async logout() {
    return {
      message: 'Đăng xuất thành công',
    };
  }
}
```

### JWT Strategy

```typescript
// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { sub: payload.sub, email: payload.email };
  }
}
```

### Login DTO

```typescript
// src/auth/dto/login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

## Database Requirements

Ensure your `nguoidung` table has these columns:

```sql
CREATE TABLE nguoidung (
  nguoidung_id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  mat_khau VARCHAR(255) NOT NULL,  -- bcrypt hashed
  ten VARCHAR(255),
  avatar VARCHAR(500),
  vaitro ENUM('admin', 'local', 'user') DEFAULT 'user',
  trangthai VARCHAR(50),
  ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Environment Variables

**`.env` or `.env.local`:**
```
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
BCRYPT_ROUNDS=10
JWT_EXPIRATION=24h
```

## Installation

```bash
# Install required packages
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install --save-dev @types/bcrypt
```

## Testing the Endpoints

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@travel.com",
    "password": "password123"
  }'
```

**Get Current User:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Using Postman

1. Create Login request → `POST /api/auth/login`
2. Copy token from response
3. Create Get Me request → `GET /api/auth/me`
4. Add Authorization header → Bearer token

## Security Best Practices

1. **Password Hashing:**
   - Always hash passwords with bcrypt before storing
   - Never store plain text passwords

2. **JWT Security:**
   - Use strong JWT_SECRET (minimum 32 characters)
   - Set appropriate token expiration (24h recommended)
   - Validate token expiration on each request

3. **CORS Configuration:**
   ```typescript
   // main.ts
   app.enableCors({
     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
     credentials: true,
   });
   ```

4. **Rate Limiting:**
   - Implement rate limiting on login endpoint
   - Prevent brute force attacks

5. **Validation:**
   - Validate all input data with DTOs
   - Use class-validator for automatic validation

## Error Handling

All endpoints should return appropriate HTTP status codes:

- 200: Success
- 400: Bad Request (invalid input)
- 401: Unauthorized (invalid credentials)
- 404: Not Found (user doesn't exist)
- 500: Internal Server Error

## Demo Credentials

For testing purposes, seed these users:

```typescript
// prisma/seed.ts
const adminUser = await prisma.nguoidung.create({
  data: {
    email: 'admin@travel.com',
    mat_khau: await bcrypt.hash('password123', 10),
    ten: 'Admin User',
    vaitro: 'admin',
    trangthai: 'active',
  },
});

const localUser = await prisma.nguoidung.create({
  data: {
    email: 'local@travel.com',
    mat_khau: await bcrypt.hash('password123', 10),
    ten: 'Local Guide',
    vaitro: 'local',
    trangthai: 'active',
  },
});

const normalUser = await prisma.nguoidung.create({
  data: {
    email: 'user@travel.com',
    mat_khau: await bcrypt.hash('password123', 10),
    ten: 'Regular User',
    vaitro: 'user',
    trangthai: 'active',
  },
});
```

## Troubleshooting

**Issue: Token expires immediately**
- Solution: Check JWT_EXPIRATION env variable is set correctly

**Issue: Password comparison always fails**
- Solution: Ensure password is hashed with bcrypt when storing

**Issue: CORS errors in browser**
- Solution: Enable CORS in main.ts for your frontend URL

**Issue: User not found after login**
- Solution: Check email exists in database and is spelled correctly
