import { WebSocket } from 'ws';
import { Redis } from 'ioredis';
import { EmailService } from './email.service';
import { NotificationType, NotificationPayload, WebSocketMessage } from '../types/notification.types';
import { logger } from '../utils/logger';

export class NotificationService {
  private connections: Map<string, WebSocket> = new Map();
  private redis: Redis;
  private emailService: EmailService;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.emailService = new EmailService();
  }

  async createNotification(
    userId: string,
    notification: Omit<NotificationPayload, 'id' | 'createdAt' | 'isRead'>
  ): Promise<NotificationPayload> {
    const notificationId = crypto.randomUUID();
    const payload: NotificationPayload = {
      ...notification,
      id: notificationId,
      isRead: false,
      createdAt: new Date(),
      userId
    };

    try {
      // Store in Redis with TTL of 30 days
      await this.redis.set(
        `notifications:${userId}:${notificationId}`,
        JSON.stringify(payload),
        'EX',
        60 * 60 * 24 * 30
      );

      // Add to user's notification list
      await this.redis.lpush(
        `notifications:${userId}`,
        notificationId
      );

      // Send real-time notification
      this.sendWebSocketNotification(userId, payload);

      // Send email for important notifications
      if (this.shouldSendEmail(notification.type)) {
        await this.emailService.sendNotificationEmail(userId, payload);
      }

      logger.info(`Notification created for user ${userId}: ${notification.type}`);
      return payload;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  private shouldSendEmail(type: NotificationType): boolean {
    return [
      NotificationType.PROJECT_INVITATION,
      NotificationType.DEADLINE_REMINDER
    ].includes(type);
  }

  private sendWebSocketNotification(userId: string, payload: NotificationPayload): void {
    const connection = this.connections.get(userId);
    if (connection) {
      const message: WebSocketMessage = {
        type: 'notification',
        payload
      };
      connection.send(JSON.stringify(message));
    }
  }

  public addConnection(userId: string, ws: WebSocket): void {
    this.connections.set(userId, ws);
    logger.info(`WebSocket connection added for user ${userId}`);
  }

  public removeConnection(userId: string): void {
    this.connections.delete(userId);
    logger.info(`WebSocket connection removed for user ${userId}`);
  }

  public async getUserNotifications(userId: string): Promise<NotificationPayload[]> {
    try {
      const notificationIds = await this.redis.lrange(`notifications:${userId}`, 0, -1);
      const notifications: NotificationPayload[] = [];

      for (const id of notificationIds) {
        const notification = await this.redis.get(`notifications:${userId}:${id}`);
        if (notification) {
          notifications.push(JSON.parse(notification));
        }
      }

      return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      logger.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  public async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      const notification = await this.redis.get(`notifications:${userId}:${notificationId}`);
      if (notification) {
        const payload: NotificationPayload = JSON.parse(notification);
        payload.isRead = true;
        await this.redis.set(
          `notifications:${userId}:${notificationId}`,
          JSON.stringify(payload)
        );
      }
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }
} 