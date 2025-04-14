import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Medal, Award, Crown, Zap, Target, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AchievementCard } from './AchievementCard';
import { AchievementUnlocked } from './AchievementUnlocked';
import { useAchievements } from '@/hooks/useAchievements';
import { Achievement, AchievementCategory } from '@/types/achievement.types';

export const AchievementShowcase = () => {
  const { achievements, progress, latestAchievement, dismissAchievement, isLoading, error } = useAchievements();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading achievements. Please try again later.</p>
      </div>
    );
  }

  const projectAchievements = achievements.filter(
    a => a.category === AchievementCategory.PROJECTS
  );
  const skillAchievements = achievements.filter(
    a => a.category === AchievementCategory.SKILLS
  );
  const collaborationAchievements = achievements.filter(
    a => a.category === AchievementCategory.COLLABORATION
  );
  const innovationAchievements = achievements.filter(
    a => a.category === AchievementCategory.INNOVATION
  );

  const completedCount = achievements.filter(
    a => progress[a.id]?.completed
  ).length;

  return (
    <div className="space-y-8">
      {/* Achievement Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-lg font-semibold text-gray-700">
              {completedCount} / {achievements.length}
            </span>
          </div>
        </div>

        {/* Project Achievements */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Project Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                progress={progress[achievement.id] || {
                  userId: '',
                  achievementId: achievement.id,
                  progress: 0,
                  completed: false,
                  currentTier: 0
                }}
              />
            ))}
          </div>
        </div>

        {/* Skill Achievements */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-500" />
            Skill Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                progress={progress[achievement.id] || {
                  userId: '',
                  achievementId: achievement.id,
                  progress: 0,
                  completed: false,
                  currentTier: 0
                }}
              />
            ))}
          </div>
        </div>

        {/* Collaboration Achievements */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-500" />
            Collaboration Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collaborationAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                progress={progress[achievement.id] || {
                  userId: '',
                  achievementId: achievement.id,
                  progress: 0,
                  completed: false,
                  currentTier: 0
                }}
              />
            ))}
          </div>
        </div>

        {/* Innovation Achievements */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Innovation Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {innovationAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                progress={progress[achievement.id] || {
                  userId: '',
                  achievementId: achievement.id,
                  progress: 0,
                  completed: false,
                  currentTier: 0
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Latest Achievement Popup */}
      <AnimatePresence>
        {latestAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-6"
          >
            <AchievementUnlocked 
              achievement={latestAchievement} 
              onClose={dismissAchievement} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 