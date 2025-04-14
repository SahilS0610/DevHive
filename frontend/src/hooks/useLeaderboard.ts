import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type LeaderboardTimeframe = 'weekly' | 'monthly' | 'allTime';
export type LeaderboardType = 'overall' | 'skill' | 'projects' | 'achievements';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  metrics: {
    projectsCompleted: number;
    skillsMastered: number;
    achievementsUnlocked: number;
    averageProjectRating: number;
  };
}

interface UseLeaderboardOptions {
  timeframe: LeaderboardTimeframe;
  category: LeaderboardType;
  skillId?: string;
  limit?: number;
}

export const useLeaderboard = (options: UseLeaderboardOptions) => {
  const { timeframe, category, skillId, limit = 10 } = options;

  const queryKey = ['leaderboard', timeframe, category, skillId, limit];

  const { data, isLoading, error } = useQuery<LeaderboardEntry[]>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/leaderboard', {
        params: {
          timeframe,
          type: category,
          skillId,
          limit,
        },
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  // Add animations for rank changes
  const [previousData, setPreviousData] = useState<LeaderboardEntry[]>([]);
  const [animations, setAnimations] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data && previousData.length > 0) {
      const newAnimations: Record<string, string> = {};
      
      data.forEach((entry) => {
        const previousEntry = previousData.find(e => e.userId === entry.userId);
        if (previousEntry) {
          const rankChange = previousEntry.rank - entry.rank;
          if (rankChange > 0) {
            newAnimations[entry.userId] = 'rank-up';
          } else if (rankChange < 0) {
            newAnimations[entry.userId] = 'rank-down';
          }
        }
      });

      setAnimations(newAnimations);
    }
    setPreviousData(data || []);
  }, [data]);

  return {
    data,
    isLoading,
    error,
    animations,
  };
}; 