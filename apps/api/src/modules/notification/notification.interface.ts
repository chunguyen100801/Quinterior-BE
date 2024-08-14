export interface NotificationEvent {
  getContent(): string;

  getLink(): string;

  getTitle(): string;
}
