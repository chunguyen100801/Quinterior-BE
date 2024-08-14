import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Options } from 'amqplib';

@Injectable()
export class RabbitService implements OnModuleDestroy {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async onModuleDestroy(): Promise<void> {
    if (!this.amqpConnection.connected) {
      return;
    }

    await this.amqpConnection.close();
  }

  async publish(
    exchange: string,
    routingKey: string,
    data: any,
    options?: Options.Publish,
  ): Promise<void> {
    await this.amqpConnection.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(data)),
      options,
    );
  }
}
