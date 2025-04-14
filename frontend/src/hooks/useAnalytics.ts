import { useState, useEffect } from 'react';
import axios from 'axios';

interface AnalyticsData {
  projectMetrics: {
    totalProjects: number;
    successRate: number;
    averageCompletionTime: number;
    skillDistribution: Record<string, number>;
    teamPerformance: {
      averageTeamSize: number;
      averageSkillDiversity: number;
      averageCompletionTime: number;
      successRate: number;
      topPerformingTeams: Array<{
        teamId: string;
        projectCount: number;
        successRate: number;
      }>;
    };
    projectTrends: Array<{
      date: string;
      completed: number;
      inProgress: number;
    }>;
  };
  skillMetrics: {
    skillGrowthRate: number;
    topGrowingSkills: Array<{
      skillId: string;
      growthRate: number;
      userCount: number;
    }>;
    skillGaps: Array<{
      skillId: string;
      demand: number;
      supply: number;
    }>;
    workshopImpact: Array<{
      workshopId: string;
      skillImprovement: number;
      participantCount: number;
    }>;
    skillDistribution: Record<string, number>;
  };
}

export const useAnalytics = (timeframe: 'week' | 'month' | 'year') => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const [projectMetrics, skillMetrics] = await Promise.all([
          axios.get(`/api/analytics/projects?timeframe=${timeframe}`),
          axios.get('/api/analytics/skills')
        ]);

        setData({
          projectMetrics: projectMetrics.data,
          skillMetrics: skillMetrics.data
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeframe]);

  return { data, isLoading, error };
}; 