import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Achievement, AchievementProgress } from '@/types/achievement.types';

const ACHIEVEMENT_CHECK_INTERVAL = 30000; // 30 seconds
const ACHIEVEMENT_DISMISS_TIMEOUT = 5000; // 5 seconds

export const useAchievements = () => {
  const queryClient = useQueryClient();
  const [latestAchievement, setLatestAchievement] = useState<Achievement | null>(null);
  const [dismissTimeout, setDismissTimeout] = useState<NodeJS.Timeout | null>(null);

  const { data: achievements = [], isLoading: isLoadingAchievements } = useQuery<Achievement[]>({
    queryKey: ['achievements'],
    queryFn: async () => {
      try {
        const response = await api.get('/achievements');
        return response.data;
      } catch (error) {
        console.error('Error fetching achievements:', error);
        throw error;
      }
    },
  });

  const { 
    data: progress = {}, 
    isLoading: isLoadingProgress,
    error: progressError 
  } = useQuery<Record<string, AchievementProgress>>({
    queryKey: ['achievement-progress'],
    queryFn: async () => {
      try {
        const response = await api.get('/achievements/progress');
        return response.data;
      } catch (error) {
        console.error('Error fetching achievement progress:', error);
        throw error;
      }
    },
    refetchInterval: ACHIEVEMENT_CHECK_INTERVAL,
  });

  const checkNewAchievements = useCallback(async () => {
    try {
      const response = await api.get('/achievements/unlocked');
      const newlyUnlocked = response.data;
      
      if (newlyUnlocked.length > 0) {
        setLatestAchievement(newlyUnlocked[0]);
        queryClient.invalidateQueries(['achievement-progress']);
        
        // Clear existing timeout if any
        if (dismissTimeout) {
          clearTimeout(dismissTimeout);
        }
        
        // Set new timeout
        const timeout = setTimeout(() => {
          setLatestAchievement(null);
        }, ACHIEVEMENT_DISMISS_TIMEOUT);
        
        setDismissTimeout(timeout);
      }
    } catch (error) {
      console.error('Error checking for new achievements:', error);
    }
  }, [queryClient, dismissTimeout]);

  useEffect(() => {
    checkNewAchievements();
    
    // Cleanup function
    return () => {
      if (dismissTimeout) {
        clearTimeout(dismissTimeout);
      }
    };
  }, [checkNewAchievements, dismissTimeout]);

  const dismissAchievement = useCallback(() => {
    setLatestAchievement(null);
    if (dismissTimeout) {
      clearTimeout(dismissTimeout);
      setDismissTimeout(null);
    }
  }, [dismissTimeout]);

  return {
    achievements,
    progress,
    latestAchievement,
    dismissAchievement,
    isLoading: isLoadingAchievements || isLoadingProgress,
    error: progressError,
  };
}; 