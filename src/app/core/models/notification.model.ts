export type NotificationType = 'stock' | 'invoice' | 'order';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  icon: string;
  colorClass: string;
}
