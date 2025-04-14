import { useState, useEffect } from 'react';
import axios from 'axios';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  requiredSkills: string[];
  currentMembers: number;
  maxMembers: number;
  timeline: {
    startDate: string;
    endDate: string;
  };
}

export const useProject = (projectId: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}`);
        setProject(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const updateProject = async (updatedProject: Project) => {
    try {
      const response = await axios.put(`/api/projects/${projectId}`, updatedProject);
      setProject(response.data);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return { project, isLoading, error, updateProject };
}; 