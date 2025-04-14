import { motion } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { Achievement } from '@/types/achievement.types';

interface AchievementUnlockedProps {
  achievement: Achievement;
  onClose: () => void;
}

const ANIMATION_DURATION = 0.3;

export const AchievementUnlocked = ({ achievement, onClose }: AchievementUnlockedProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: ANIMATION_DURATION }}
      className="relative"
      role="alert"
      aria-live="polite"
      onKeyDown={handleKeyDown}
    >
      <div className="absolute -top-2 -right-2">
        <button
          onClick={onClose}
          className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close achievement notification"
        >
          <X className="w-4 h-4 text-white" aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <div 
            className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-300 flex items-center justify-center"
            aria-hidden="true"
          >
            <Trophy className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: ANIMATION_DURATION }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-xs font-bold text-white">+{achievement.xpReward}</span>
          </motion.div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Achievement Unlocked!</h3>
          <p className="text-white/80">{achievement.title}</p>
          <p className="text-sm text-white/60">{achievement.description}</p>
        </div>
      </div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden"
        aria-hidden="true"
      >
        <div className="h-full bg-yellow-400" />
      </motion.div>
    </motion.div>
  );
}; 