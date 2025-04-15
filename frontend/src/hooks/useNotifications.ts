import { create } from 'zustand';
import { toast } from 'sonner';
import { NotificationPayload } from '@/types/notification.types';

interface NotificationStore {
  notifications: NotificationPayload[];
  addNotification: (notification: NotificationPayload) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotifications = create<NotificationStore>((set) => ({
  notifications: [],
  
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications]
    }));

    // Show toast for new notifications
    toast(notification.title, {
      description: notification.message,
      icon: '🔔',
      action: {
        label: 'View',
        onClick: () => window.location.href = notification.link || '#'
      }
    });
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      )
    }));
  },

  clearAll: () => set({ notifications: [] })
})); 