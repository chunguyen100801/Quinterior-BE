import * as path from 'path';
import { RedisModule } from '@datn/redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiDataModule, ApiDataService } from '@datn/prisma';

import { AuthModule } from './modules/auth/auth.module';
import { BullModule } from '@nestjs/bullmq';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ImageGenerateModule } from './modules/image-generate/image-generate.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { HealthModule } from './modules/health/health.module';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from './modules/mail/mail.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { NotificationModule } from './modules/notification/notification.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskModule } from './modules/task/task.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { UserModule } from './modules/user/user.module';
import configs from './configs';
import { DistributedLockModule } from './modules/distributed-lock/distributed-lock.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderItemModule } from './modules/order-item/order-item.module';
import { OrderModule } from './modules/order/order.module';
import { v4 } from 'uuid';
import { SearchModule } from './modules/image-search/search.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { ROUTES } from './constants';
import { ReviewModule } from './modules/review/review.module';
import { RabbitModule } from '@datn/rabbitmq';
import { SellerModule } from './modules/seller/seller.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AddressModule } from './modules/address/address.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { CreditModule } from './modules/credit/credit.module';
import { TokenModule } from './modules/token/token.module';
import { AiSuggestModule } from './modules/ai-suggest/ai-suggest.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      cache: true,
      expandVariables: true,
      envFilePath: process.env.NODE_ENV == 'development' ? '.env.dev' : '.env',
      validationOptions: {
        abortEarly: false,
      },
    }),
    ClsModule.forRoot({
      plugins: [
        new ClsPluginTransactional({
          imports: [ApiDataModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: ApiDataService,
          }),
          enableTransactionProxy: true,
        }),
      ],
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request) => req.headers['X-Request-Id'] ?? v4(),
      },
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.getOrThrow('throttler.ttl'),
            limit: configService.getOrThrow('throttler.limit'),
            storage: new ThrottlerStorageRedisService({
              db: configService.getOrThrow('redis.dbThrottler'),
              host: configService.getOrThrow('redis.host'),
              port: configService.getOrThrow('redis.port'),
              username: configService.getOrThrow('redis.username'),
              password: configService.getOrThrow('redis.password'),
            }),
          },
        ],
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.getOrThrow('mail.host'),
          port: config.getOrThrow('mail.port'),
          secure: true,
          auth: {
            user: config.getOrThrow('mail.username'),
            pass: config.getOrThrow('mail.password'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
        template: {
          dir: path.join(__dirname, '/templates/'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    ApiDataModule,
    JwtModule.register({}),
    EventEmitterModule.forRoot(),
    PrometheusModule.register({
      path: ROUTES.METRICS,
    }),
    RedisModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          db: configService.getOrThrow('redis.dbBullQueue'),
          host: configService.getOrThrow('redis.host'),
          port: configService.getOrThrow('redis.port'),
          username: configService.getOrThrow('redis.username'),
          password: configService.getOrThrow('redis.password'),
        },
      }),
    }),
    ScheduleModule.forRoot(),
    RabbitModule,
    GatewayModule,
    DistributedLockModule,
    MailModule,
    AuthModule,
    UserModule,
    HealthModule,
    NotificationModule,
    ImageGenerateModule,
    TaskModule,
    CategoryModule,
    ProductModule,
    CartModule,
    OrderModule,
    OrderItemModule,
    SearchModule,
    ReviewModule,
    SellerModule,
    PaymentModule,
    AddressModule,
    WorkspaceModule,
    CreditModule,
    TokenModule,
    AiSuggestModule,
  ],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
