import { Link } from 'react-router-dom';

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

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
        
        <p className="mt-2 text-gray-600 line-clamp-3">{project.description}</p>

        <div className="mt-4">
          <div className="text-sm text-gray-500">
            Timeline: {formatDate(project.timeline.startDate)} - {formatDate(project.timeline.endDate)}
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900">Required Skills</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {project.skills.map(skill => (
              <span
                key={skill}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {project.team.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Team Members</h4>
            <div className="mt-2 flex -space-x-2">
              {project.team.map(member => (
                <img
                  key={member.id}
                  className="w-8 h-8 rounded-full border-2 border-white"
                  src={member.avatar}
                  alt={member.name}
                  title={member.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 