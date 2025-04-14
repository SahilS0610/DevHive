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
        const response = await axios.get('/api/projects', {
          params: {
            status: filters.status || undefined,
            skills: filters.skills.length ? filters.skills : undefined,
            search: filters.search || undefined
          }
        });
        setProjects(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [filters]);

  return { projects, isLoading, error };
}; 