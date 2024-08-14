import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { IAuthenticatedSocket, INotification, PROVIDERS } from '@datn/shared';
import { Server } from 'socket.io';
import { Inject, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { IGatewaySessionManager } from './gateway.interface';
import { NotificationService } from '../notification/notification.service';
import { CreateOrderEvent } from '../order/order.event';
import { SOCKET_EVENTS } from '../../constants';
import {
  MessageHandlerErrorBehavior,
  Nack,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  pingInterval: 10000,
  pingTimeout: 15000,
})
export class WsGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleInit,
    OnModuleDestroy
{
  @WebSocketServer()
  server: Server;
  private logger = new Logger(WsGateway.name);

  constructor(
    @Inject(PROVIDERS.GATEWAY_SESSION_MANAGER)
    readonly session: IGatewaySessionManager,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    this.server.on('connection', (socket: IAuthenticatedSocket) => {
      this.logger.log('New connection');
      this.logger.log(`Socket id: ${socket.id} - Has connected!`);
    });
  }

  onModuleDestroy() {
    this.eventEmitter.removeAllListeners(CreateOrderEvent.EVENT_NAME);
  }

  handleConnection(socket: IAuthenticatedSocket): void {
    this.session.setUserSocket(socket.user.id, socket);
    socket.emit('connected');
  }

  handleDisconnect(socket: IAuthenticatedSocket) {
    this.session.removeUserSocket(socket.user.id);
    socket.emit('disconnected');
  }

  @OnEvent('notification:created')
  async handleCreateOrderEvent(event: CreateOrderEvent) {
    const socket = this.session.getUserSocket(event.recipientId);

    const notification = await this.notificationService.createNotification({
      title: event.getTitle(),
      content: event.getContent(),
      link: event.getLink(),
      creatorId: event.creator.id,
      isRead: false,
      recipientId: event.recipientId,
    });

    if (socket) {
      socket.emit(SOCKET_EVENTS.NOTIFICATION_CREATED, notification);
    }
  }

  @RabbitSubscribe({
    exchange: 'create.notification',
    routingKey: 'all',
    queue: 'create.notification',
    createQueueIfNotExists: true,
    errorBehavior: MessageHandlerErrorBehavior.ACK,
  })
  async handleNotification(message: INotification) {
    try {
      this.logger.log('Received notification message from RabbitMQ');
      const notification =
        await this.notificationService.createNotification(message);

      const socket = this.session.getUserSocket(message.recipientId);
      if (socket) {
        socket.emit(SOCKET_EVENTS.NOTIFICATION_CREATED, notification);
      }
    } catch (error) {
      this.logger.error(error);
      return new Nack(true);
    }
  }
}
