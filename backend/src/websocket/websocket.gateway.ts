import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
  }
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string[]> = new Map();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Store socket connection
      const userConnections = this.userSockets.get(userId) || [];
      userConnections.push(client.id);
      this.userSockets.set(userId, userConnections);

      client.join(`user:${userId}`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Remove socket connection
    for (const [userId, sockets] of this.userSockets.entries()) {
      const index = sockets.indexOf(client.id);
      if (index !== -1) {
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  sendNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  broadcastProjectUpdate(projectId: string, update: any) {
    this.server.to(`project:${projectId}`).emit('projectUpdate', update);
  }

  @SubscribeMessage('joinProject')
  handleJoinProject(client: Socket, projectId: string) {
    client.join(`project:${projectId}`);
  }

  @SubscribeMessage('leaveProject')
  handleLeaveProject(client: Socket, projectId: string) {
    client.leave(`project:${projectId}`);
  }
} 