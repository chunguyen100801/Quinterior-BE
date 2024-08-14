import { NotificationEvent } from '../notification/notification.interface';
import { OrderStatus, PaymentType, User } from '@prisma/db-api';

export enum OrderEventName {
  CREATE_NOTIFICATION = 'create.notification',
}

export abstract class OrderEvent implements NotificationEvent {
  constructor(
    public readonly orderId: number,
    public readonly creator: User,
    public readonly recipientId: number,
  ) {}

  abstract getContent(): string;

  getLink(): string {
    return `/orders/${this.orderId}`;
  }

  abstract getTitle(): string;

  toJSON() {
    return {
      creatorId: this.creator.id,
      recipientId: this.recipientId,
      title: this.getTitle(),
      content: this.getContent(),
      link: this.getLink(),
      isRead: false,
    };
  }
}

export class CreateOrderEvent extends OrderEvent {
  static EVENT_NAME = OrderEventName.CREATE_NOTIFICATION;

  constructor(
    orderId: number,
    creator: User,
    recipientId: number,
    private readonly paymentType: PaymentType,
  ) {
    super(orderId, creator, recipientId);
  }

  getContent(): string {
    return `Order #${this.orderId} has been created by ${this.creator.firstName} ${this.creator.lastName} with payment type ${this.paymentType}`;
  }

  getTitle(): string {
    return 'New order created';
  }
}

export class ChangeOrderStatusEvent extends OrderEvent {
  static EVENT_NAME = OrderEventName.CREATE_NOTIFICATION;

  constructor(
    orderId: number,
    creator: User,
    recipientId: number,
    private readonly status: OrderStatus,
  ) {
    super(orderId, creator, recipientId);
  }

  getContent(): string {
    return `Order #${this.orderId} status has been changed to ${this.status} by ${this.creator.firstName} ${this.creator.lastName}`;
  }

  getTitle(): string {
    return `Order ${this.orderId} status has been changed to ${this.status}`;
  }
}

export class CancelOrderEvent extends OrderEvent {
  static EVENT_NAME = OrderEventName.CREATE_NOTIFICATION;

  getContent(): string {
    return `Order #${this.orderId} has been canceled by ${this.creator.firstName} ${this.creator.lastName}`;
  }

  getTitle(): string {
    return `Order ${this.orderId} has been canceled`;
  }
}

export class PaymentOrderEvent extends OrderEvent {
  static EVENT_NAME = OrderEventName.CREATE_NOTIFICATION;

  constructor(
    orderId: number,
    creator: User,
    recipientId: number,
    private readonly paymentType: PaymentType,
  ) {
    super(orderId, creator, recipientId);
  }

  getContent(): string {
    return `Order #${this.orderId} has been paid successfully with payment type ${this.paymentType}`;
  }

  getTitle(): string {
    return `Order ${this.orderId} has been paid successfully`;
  }
}
