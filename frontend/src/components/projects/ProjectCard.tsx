import { Link } from 'react-router-dom';

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

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            <Link to={`/projects/${project.id}`} className="hover:text-indigo-600">
              {project.title}
            </Link>
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
            {project.status.replace('_', ' ')}
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {project.description}
        </p>

        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {project.requiredSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div>
            {project.currentMembers}/{project.maxMembers} members
          </div>
          <div>
            {new Date(project.timeline.startDate).toLocaleDateString()} -{' '}
            {new Date(project.timeline.endDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}; 