export type NotificationType = 'deadline' | 'payment' | 'project' | 'client' | 'info' | 'success' | 'warning' | 'alert';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority?: 'low' | 'normal' | 'high';
  link?: string;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: NotificationType;
  time?: string;
  targetUrl?: string;
}

export interface BackendNotificationResponse {
  id: string;
  type?: string;
  title: string;
  message: string;
  time?: string;
  read?: boolean;
  targetUrl?: string;
}
