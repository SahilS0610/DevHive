import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { NotificationPayload } from '@/types/notification.types';

interface Props {
  notification: NotificationPayload;
  onRead: (id: string) => void;
}

export const NotificationItem = ({ notification, onRead }: Props) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'project_invitation':
        return '👥';
      case 'project_update':
        return '📝';
      case 'team_message':
        return '💬';
      case 'deadline_reminder':
        return '⏰';
      case 'skill_match':
        return '🎯';
      default:
        return '📢';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
      onClick={() => onRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getIcon()}</span>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{notification.title}</h4>
          <p className="text-sm text-gray-600">{notification.message}</p>
          <span className="text-xs text-gray-400">
            {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}; 