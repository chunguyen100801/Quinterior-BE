export interface INotification {
  recipientId: number;
  creatorId: number;
  title: string;
  content: string;
  link: string;
  isRead: boolean;
}
