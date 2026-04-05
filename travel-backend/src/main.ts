import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup Global Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Setup Global Interceptor
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // Setup Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Tất cả route sẽ có prefix /api (VD: /api/places/route)
  app.setGlobalPrefix('api');

  // Cho phép Frontend gọi Backend (CORS)
  app.enableCors();

  // Cấu hình giao diện Swagger để Demo API
  const config = new DocumentBuilder()
    .setTitle('Travel Planner API - Minh Quang')
    .setDescription('Hệ thống quản lý lịch trình du lịch thông minh TP.HCM')
    .setVersion('1.0')
    .addTag('travel')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document); // Truy cập Swagger tại /swagger

  // Lấy port từ biến môi trường, mặc định là 3001
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`✅ Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger UI available at: http://localhost:${port}/swagger`);
}
bootstrap();
