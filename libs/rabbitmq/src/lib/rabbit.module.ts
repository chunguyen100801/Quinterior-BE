import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitService } from './rabbit.service';
import { RabbitHealthIndicator } from './rabbit.health';

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: async (configService: ConfigService) => {
        const rabbitmqUri = configService.get('rabbit.uri');

        return {
          uri: rabbitmqUri,
          exchanges: [
            {
              name: 'generate.image',
              type: 'direct',
            },
            {
              name: 'process.complete',
              type: 'direct',
            },
            {
              name: 'create.notification',
              type: 'direct',
            },
          ],
          queues: [
            {
              name: 'image.generate.image',
              routingKey: ['image'],
              exchange: 'generate.image',
              persistent: true,
            },
            {
              name: 'text.generate.image',
              routingKey: ['text'],
              exchange: 'generate.image',
              persistent: true,
            },
            {
              name: 'process.complete',
              routingKey: ['image'],
              exchange: 'process.complete',
              persistent: true,
            },
            {
              name: 'create.notification',
              routingKey: ['all'],
              exchange: 'create.notification',
              persistent: true,
            },
          ],
          connectionInitOptions: {
            wait: false,
          },
          enableControllerDiscovery: true,
          logger: new Logger(RabbitModule.name),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RabbitService, RabbitHealthIndicator],
  exports: [RabbitService, RabbitHealthIndicator],
})
export class RabbitModule {}
