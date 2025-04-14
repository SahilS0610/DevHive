import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { NotificationPayload } from '@/types/notification.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

  const getTypeBadge = () => {
    switch (notification.type) {
      case 'project_invitation':
        return 'Project';
      case 'project_update':
        return 'Update';
      case 'team_message':
        return 'Message';
      case 'deadline_reminder':
        return 'Reminder';
      case 'skill_match':
        return 'Match';
      default:
        return 'System';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`p-4 hover:bg-gray-50 transition-colors ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-gray-900 truncate">
              {notification.title}
            </h4>
            <Badge variant="secondary" className="text-xs">
              {getTypeBadge()}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
            </span>
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => onRead(notification.id)}
              >
                Mark as read
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 