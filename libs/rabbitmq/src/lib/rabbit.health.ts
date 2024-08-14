import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { fromEvent, lastValueFrom, map, merge, Observable, of } from 'rxjs';
import { HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class RabbitHealthIndicator {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async statusCheck(): Promise<HealthIndicatorResult> {
    const isHealthy = await lastValueFrom(this.watch());

    if (isHealthy) {
      return {
        rabbitmq: { status: 'up' },
      };
    }

    return {
      rabbitmq: { status: 'down' },
    };
  }

  check(): boolean {
    return this.amqpConnection.managedConnection.isConnected();
  }

  watch(): Observable<boolean> {
    return merge(
      of(this.check()),
      fromEvent(this.amqpConnection.managedConnection, 'close').pipe(
        map((): boolean => false),
      ),
      fromEvent(this.amqpConnection.managedConnection, 'error').pipe(
        map((): boolean => false),
      ),
      fromEvent(this.amqpConnection.managedConnection, 'connect').pipe(
        map((): boolean => true),
      ),
    );
  }
}
