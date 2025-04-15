import { WebSocket } from 'ws';
import { Redis } from 'ioredis';
import { EmailService } from './email.service';
import { NotificationType, NotificationPayload, WebSocketMessage } from '../types/notification.types';
import { logger } from '../utils/logger';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/Notification';
import { User } from '../entities/User';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class NotificationService {
  private connections: Map<string, WebSocket> = new Map();
  private redis: Redis;
  private emailService: EmailService;

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private wsGateway: WebSocketGateway
  ) {
    this.redis = new Redis(process.env.REDIS_URL);
    this.emailService = new EmailService();
  }

  async createNotification(
    userId: string,
    type: string,
    content: string,
    metadata?: any
  ): Promise<Notification> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId }
    });

    const notification = this.notificationRepository.create({
      user,
      type,
      content,
      metadata,
      read: false
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // Send real-time notification
    this.wsGateway.sendNotification(userId, savedNotification);

    return savedNotification;
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

  public async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' }
    });
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOneOrFail({
      where: { id: notificationId }
    });

    notification.read = true;
    notification.readAt = new Date();

    return this.notificationRepository.save(notification);
  }
} 