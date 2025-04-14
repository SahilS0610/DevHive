import { create } from 'zustand';
import { NotificationPayload } from '@/types/notification.types';
import { WebSocketService } from '@/services/websocket.service';

interface NotificationStore {
  notifications: NotificationPayload[];
  wsService: WebSocketService | null;
  addNotification: (notification: NotificationPayload) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  initialize: (userId: string) => void;
  cleanup: () => void;
}

export const useNotifications = create<NotificationStore>((set, get) => ({
  notifications: [],
  wsService: null,

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications]
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      )
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true }))
    }));
  },

  clearAll: () => set({ notifications: [] }),

  initialize: (userId: string) => {
    // Initialize WebSocket connection
    const wsService = new WebSocketService((notification) => {
      get().addNotification(notification);
    });

    // Fetch initial notifications
    fetch(`/api/notifications/${userId}`)
      .then(res => res.json())
      .then(data => {
        set({ notifications: data });
      })
      .catch(error => {
        console.error('Error fetching notifications:', error);
      });

    set({ wsService });
  },

  cleanup: () => {
    const { wsService } = get();
    if (wsService) {
      wsService.disconnect();
    }
    set({ wsService: null });
  }
})); 