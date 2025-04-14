import { useState, useEffect } from 'react';
import axios from 'axios';

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export const useProjectMilestones = (projectId: string) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}/milestones`);
        setMilestones(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMilestones();
  }, [projectId]);

  const addMilestone = async (milestone: Omit<Milestone, 'id'>) => {
    try {
      const response = await axios.post(`/api/projects/${projectId}/milestones`, milestone);
      setMilestones([...milestones, response.data]);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateMilestone = async (milestoneId: string, updatedMilestone: Partial<Milestone>) => {
    try {
      const response = await axios.patch(
        `/api/projects/${projectId}/milestones/${milestoneId}`,
        updatedMilestone
      );
      setMilestones(milestones.map(milestone =>
        milestone.id === milestoneId ? response.data : milestone
      ));
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteMilestone = async (milestoneId: string) => {
    try {
      await axios.delete(`/api/projects/${projectId}/milestones/${milestoneId}`);
      setMilestones(milestones.filter(milestone => milestone.id !== milestoneId));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return { milestones, isLoading, error, addMilestone, updateMilestone, deleteMilestone };
}; 