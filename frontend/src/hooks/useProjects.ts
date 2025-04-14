import { useState, useEffect } from 'react';
import axios from 'axios';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  skills: string[];
  timeline: {
    startDate: Date;
    endDate: Date;
  };
  team: {
    id: string;
    name: string;
    avatar: string;
  }[];
}

interface ProjectFilters {
  status: string;
  skills: string[];
  search: string;
}

export const useProjects = (filters: ProjectFilters) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/projects', { params: filters });
        setProjects(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [filters]);

  return { projects, isLoading, error };
}; 