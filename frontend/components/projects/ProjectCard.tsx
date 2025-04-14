import { format } from 'date-fns';
import { Users, Calendar, ChevronRight } from 'lucide-react';
import { Project } from '@/types/dashboard.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressChart } from '../shared/ProgressChart';

interface ProjectCardProps {
  project: Project;
  variant?: 'default' | 'dashboard';
}

export const ProjectCard = ({ project, variant = 'default' }: ProjectCardProps) => {
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500';
      case 'completed':
        return 'bg-blue-500';
      case 'on_hold':
        return 'bg-amber-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-100 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-slate-800">{project.title}</h3>
            <Badge variant={project.role === 'leader' ? 'default' : 'secondary'}>
              {project.role}
            </Badge>
          </div>
          <p className="text-sm text-slate-600">{project.description}</p>
        </div>
        <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-slate-600">
              <Users className="h-4 w-4 mr-1" />
              <span>{project.members} members</span>
            </div>
            <div className="flex items-center text-slate-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{format(project.deadline, 'MMM d, yyyy')}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-blue-600">
            View Details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <ProgressChart value={project.progress} className="h-2" />
        </div>
      </div>
    </div>
  );
}; 