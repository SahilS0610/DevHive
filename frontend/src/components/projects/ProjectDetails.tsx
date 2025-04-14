import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '@/hooks/useProject';
import { TeamManagement } from './TeamManagement';
import { MilestoneList } from './MilestoneList';

export const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { project, isLoading, error, updateProject } = useProject(id);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'milestones'>('overview');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading project</div>;
  if (!project) return <div>Project not found</div>;

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateProject({ ...project, status: newStatus });
    } catch (error) {
      console.error('Failed to update project status:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {project.title}
            </h3>
            <select
              value={project.status}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Project ID: {project.id}
          </p>
        </div>

        <div className="border-t border-gray-200">
          <nav className="flex space-x-8 px-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`${
                activeTab === 'team'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Team
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`${
                activeTab === 'milestones'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Milestones
            </button>
          </nav>
        </div>

        <div className="px-4 py-5 sm:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="mt-1 text-sm text-gray-900">{project.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Required Skills</h4>
                <div className="mt-2 flex flex-wrap gap-2">
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

              <div>
                <h4 className="text-sm font-medium text-gray-500">Timeline</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(project.timeline.startDate).toLocaleDateString()} -{' '}
                  {new Date(project.timeline.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'team' && <TeamManagement project={project} />}
          {activeTab === 'milestones' && <MilestoneList project={project} />}
        </div>
      </div>
    </div>
  );
}; 