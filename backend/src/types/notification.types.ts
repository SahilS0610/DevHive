export enum NotificationType {
  PROJECT_INVITATION = 'project_invitation',
  PROJECT_UPDATE = 'project_update',
  TEAM_MESSAGE = 'team_message',
  DEADLINE_REMINDER = 'deadline_reminder',
  SKILL_MATCH = 'skill_match',
  SYSTEM_ALERT = 'system_alert'
}

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  userId: string;
  link?: string;
  icon?: string;
}

export interface WebSocketMessage {
  type: 'notification';
  payload: NotificationPayload;
}

export interface EmailNotificationTemplate {
  subject: string;
  html: string;
  text: string;
} 