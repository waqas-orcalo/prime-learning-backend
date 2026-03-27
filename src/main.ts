import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const httpAdapterHost = app.get(HttpAdapterHost);

  // ── Global prefix ─────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── CORS ──────────────────────────────────────────────────────────────────
  // CORS_ORIGINS can be a comma-separated list, e.g.:
  //   http://localhost:3001,https://your-deployed-frontend.com
  // or a single wildcard '*' to allow all origins (dev only).
  //
  // IMPORTANT: browsers block credentials:true + origin:'*' — so we always
  // echo the request origin back instead of passing a literal '*'.
  const rawOrigins = configService.get<string>('CORS_ORIGINS', '*');
  const allowList: string[] | null =
    rawOrigins === '*'
      ? null  // null = allow all (will echo origin back)
      : rawOrigins.split(',').map((o) => o.trim()).filter(Boolean);

  app.enableCors({
    origin: (requestOrigin, callback) => {
      // Allow server-to-server / Swagger / curl (no Origin header)
      if (!requestOrigin) return callback(null, true);
      // Wildcard mode — echo the request origin back
      if (!allowList) return callback(null, true);
      // Explicit list — check membership
      if (allowList.includes(requestOrigin)) return callback(null, true);
      callback(new Error(`CORS: origin "${requestOrigin}" is not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // ── Global Validation Pipe ────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global Exception Filter ───────────────────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // ── Swagger ───────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Prime Learning API')
    .setDescription('Monolithic NestJS backend – v2-with-notifications')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // ── Start ─────────────────────────────────────────────────────────────────
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  Logger.log(`🚀  Server running on  http://localhost:${port}/api/v1`);
  Logger.log(`📖  Swagger docs at    http://localhost:${port}/api/docs`);
}
bootstrap();
