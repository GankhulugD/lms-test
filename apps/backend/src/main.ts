import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // H5P core/editor-ийн static JS/CSS файлууд (H5pService-ийн config.baseUrl-тэй
  // нийцсэн бүтэн зам дээр serve хийнэ, учир нь setGlobalPrefix статик
  // middleware-д автоматаар нэмэгддэггүй).
  app.useStaticAssets(path.join(process.cwd(), 'h5p', 'core'), {
    prefix: '/api/v1/h5p/core',
  });
  app.useStaticAssets(path.join(process.cwd(), 'h5p', 'editor'), {
    prefix: '/api/v1/h5p/editor',
  });

  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('LMS API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();