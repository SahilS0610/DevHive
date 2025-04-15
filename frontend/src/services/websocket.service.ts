import { useNotifications } from '@/hooks/useNotifications';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    
    this.ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      useNotifications.getState().addNotification(notification);
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, 1000 * Math.pow(2, this.reconnectAttempts));
      }
    };
  }
} 