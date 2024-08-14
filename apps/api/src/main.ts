import {
  Environment,
  HttpExceptionFilter,
  PrismaClientExceptionFilter,
} from '@datn/shared';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  Logger,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { setupSwagger } from './setup-swagger';
import { initWebsocketAdapters } from './ws-adapter-init';
import chalk from 'chalk';
import { loggerConfig } from '@datn/logger';
import { initTracing } from '@datn/tracing';

async function bootstrap(): Promise<NestExpressApplication> {
  const logger = new Logger('Bootstrap');
  try {
    await initTracing();

    const app = await NestFactory.create<NestExpressApplication>(
      AppModule,
      new ExpressAdapter(),
      {
        cors: true,
        logger: loggerConfig,
      },
    );
    const configService = app.get(ConfigService);

    logger.log(
      `Environment: ${chalk
        .hex('#87e8de')
        .bold(
          `${configService.getOrThrow<string>('app.nodeEnv').toUpperCase()}`,
        )}`,
    );

    const PORT = configService.getOrThrow<number>('app.port') || 3001;
    const apiPrefix = configService.getOrThrow<string>('app.apiPrefix');
    const isDocumentEnabled = configService.getOrThrow<boolean>(
      'app.documentEnabled',
    );
    const isDevelopment =
      configService.getOrThrow<string>('app.nodeEnv') ===
      Environment.DEVELOPMENT;

    app.set('trust proxy', 1);
    app.use(helmet());
    app.use(
      rateLimit({
        windowMs: 60 * 60 * 1000, // 60 minutes
        limit: 1000, // limit each IP to 1000 requests per windowMs
      }),
    );
    app.useBodyParser('json', { limit: '50mb' });
    app.useBodyParser('urlencoded', {
      limit: '50mb',
      extended: true,
      parameterLimit: 50000,
    });
    app.use(compression());
    app.use(morgan('combined'));
    app.enableVersioning({ type: VersioningType.URI });
    app.enableVersioning();
    app.setGlobalPrefix(apiPrefix, { exclude: ['health', 'metrics'] });

    initWebsocketAdapters(app);

    app.useGlobalPipes(
      new ValidationPipe({
        enableDebugMessages: isDevelopment,
        transform: true, // Automatically transform payloads to DTO instances
        transformOptions: { enableImplicitConversion: true }, // Enable implicit conversion
        whitelist: true, // Remove all non-whitelisted properties
        exceptionFactory: (errors: ValidationError[]) =>
          new UnprocessableEntityException(errors),
      }),
    );

    const { httpAdapter } = app.get(HttpAdapterHost);
    const reflector = app.get(Reflector);

    app.useGlobalFilters(
      new HttpExceptionFilter(reflector),
      new PrismaClientExceptionFilter(httpAdapter),
    );

    //Swagger
    if (isDocumentEnabled) {
      setupSwagger(app, configService);
    }

    //Enable shutdown hooks
    if (!isDevelopment) {
      app.enableShutdownHooks();
    }

    await app.listen(PORT, () =>
      logger.log(
        `🚀 Server is listening on port ${chalk
          .hex('#87e8de')
          .bold(`${PORT}`)}`,
      ),
    );

    return app;
  } catch (error) {
    logger.error(`❌  Error starting server, ${error}`);
    process.exit();
  }
}

void bootstrap();
