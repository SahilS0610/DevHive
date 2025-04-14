import { motion } from 'framer-motion';
import { Trophy, Star, Target, Users } from 'lucide-react';
import { 
  Achievement, 
  AchievementProgress, 
  AchievementTier,
  AchievementCategory
} from '../../../types/achievement.types';

interface AchievementCardProps {
  achievement: Achievement;
  progress: AchievementProgress;
}

const TIER_COLORS: Record<AchievementTier, string> = {
  [AchievementTier.BRONZE]: 'from-amber-600 to-amber-400',
  [AchievementTier.SILVER]: 'from-gray-400 to-gray-200',
  [AchievementTier.GOLD]: 'from-yellow-500 to-yellow-300',
  [AchievementTier.PLATINUM]: 'from-blue-400 to-blue-200',
};

const CATEGORY_ICONS: Record<AchievementCategory, typeof Trophy> = {
  [AchievementCategory.PROJECTS]: Trophy,
  [AchievementCategory.SKILLS]: Target,
  [AchievementCategory.COLLABORATION]: Users,
  [AchievementCategory.INNOVATION]: Star,
};

export const AchievementCard = ({ achievement, progress }: AchievementCardProps) => {
  const target = achievement.requirements[0]?.target || 1;
  const progressPercentage = Math.min((progress.progress / target) * 100, 100);
  const isCompleted = progress.completed;
  const CategoryIcon = CATEGORY_ICONS[achievement.category];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-xl shadow-lg ${
        isCompleted ? 'ring-2 ring-yellow-500' : ''
      }`}
      role="article"
      aria-label={`${achievement.title} achievement`}
    >
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${TIER_COLORS[achievement.tier]}`}
        aria-hidden="true"
      />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CategoryIcon className="w-6 h-6" aria-hidden="true" />
            <span className="text-lg font-semibold text-white">{achievement.title}</span>
          </div>
          <span className="text-2xl" role="img" aria-label="Achievement icon">
            {achievement.icon}
          </span>
        </div>

        <p className="text-white/90 mb-4">{achievement.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white/80">
            <span>Progress</span>
            <span>
              {progress.progress}/{target}
            </span>
          </div>
          
          <div 
            className="h-2 bg-white/20 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progress.progress}
            aria-valuemin={0}
            aria-valuemax={target}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full ${
                isCompleted ? 'bg-yellow-400' : 'bg-white/40'
              }`}
            />
          </div>
        </div>

        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center justify-between"
          >
            <span className="text-yellow-400 font-semibold">Completed!</span>
            <span className="text-yellow-400">+{achievement.xpReward} XP</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}; 