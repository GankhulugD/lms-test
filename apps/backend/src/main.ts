import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // АНХААР — MIDDLEWARE-ИЙН ЭРЭМБЭ ЧУХАЛ: helmet()/enableCors()-ийг
  // useStaticAssets-ээс ӨМНӨ бүртгэнэ. Учир нь Express-ийн static middleware
  // тохирсон хүсэлтийг шууд боловсруулж дуусгадаг тул дараа нь бүртгэсэн CORS
  // middleware хэзээ ч ажиллахгүй үлдэж, H5P-ийн font/css static файлууд
  // "No 'Access-Control-Allow-Origin' header" алдаатай блоклогддог байсан.
  app.use(
    helmet({
      // H5P core/editor/library-ийн бүх static файл (JS/CSS/font/зураг) нь
      // frontend (Cloudflare Workers, ӨӨР domain)-аас cross-origin ачаалагдах
      // ёстой public assets. Helmet-ийн анхны утга
      // 'Cross-Origin-Resource-Policy: same-origin' нь CORS зөв тохируулсан
      // байсан ч гэсэн хөтчид эдгээрийг блоклуулдаг (ERR_BLOCKED_BY_RESPONSE.
      // NotSameOrigin) тул 'cross-origin' болгож сулруулна.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });

  // H5P core/editor-ийн static JS/CSS файлууд (H5pService-ийн config.baseUrl-тэй
  // нийцсэн бүтэн зам дээр serve хийнэ, учир нь setGlobalPrefix статик
  // middleware-д автоматаар нэмэгддэггүй).
  app.useStaticAssets(path.join(process.cwd(), 'h5p', 'core'), {
    prefix: '/api/v1/h5p/core',
  });
  app.useStaticAssets(path.join(process.cwd(), 'h5p', 'editor'), {
    prefix: '/api/v1/h5p/editor',
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