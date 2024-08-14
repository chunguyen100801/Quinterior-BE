import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { Module } from '@nestjs/common';
import { QUEUES } from '@datn/shared';
import { SendMailProcessor } from './queues/send-mail.processor';
@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: QUEUES.SEND_MAIL,
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
  ],
  providers: [MailService, SendMailProcessor],
  controllers: [MailController],
  exports: [MailService],
})
export class MailModule {}
