import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from './ProjectCard';
import { ProjectFilters } from './ProjectFilters';

interface ProjectFilters {
  status: string;
  skills: string[];
  search: string;
}

export const ProjectList = () => {
  const [filters, setFilters] = useState<ProjectFilters>({
    status: '',
    skills: [],
    search: ''
  });

  const { projects, isLoading, error } = useProjects(filters);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading projects</div>;

  return (
    <div className="space-y-6">
      <ProjectFilters
        filters={filters}
        onChange={setFilters}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
          />
        ))}
      </div>
    </div>
  );
}; 