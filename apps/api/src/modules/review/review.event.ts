import { NotificationEvent } from '../notification/notification.interface';
import { User } from '@prisma/db-api';

export abstract class ReviewEvent implements NotificationEvent {
  constructor(
    public readonly productId: number,
    public readonly creator: User,
    public readonly recipientId: number,
  ) {}

  abstract getContent(): string;

  abstract getLink(): string;

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

export class CreateReviewEvent extends ReviewEvent {
  static EVENT_NAME: string = 'create.notification';

  constructor(
    productId: number,
    creator: User,
    recipientId: number,
    private readonly reviewId: number,
  ) {
    super(productId, creator, recipientId);
  }

  getContent(): string {
    return `Review product #${this.productId} has been created by ${this.creator.firstName} ${this.creator.lastName}`;
  }

  getLink(): string {
    return `reviews/${this.reviewId}`;
  }

  getTitle(): string {
    return 'New review of your product created';
  }
}
