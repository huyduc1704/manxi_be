import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Cấu hình Swagger (OpenAPI)
  const config = new DocumentBuilder()
    .setTitle('Manxi Spa API')
    .setDescription('Tài liệu API cho hệ thống Manxi Spa')
    .setVersion('1.0')
    .addBearerAuth() // Thêm nút nhập Token
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Tích hợp Scalar (Giao diện API Docs đẹp hơn Swagger UI cũ)
  app.use(
    '/docs',
    apiReference({
      theme: 'purple',
      spec: {
        content: document,
      },
    } as any),
  );

  await app.listen(process.env.PORT ?? 8080);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 8080}`);
  console.log(`API Docs (Scalar) available at: http://localhost:${process.env.PORT ?? 8080}/docs`);
}
bootstrap();
