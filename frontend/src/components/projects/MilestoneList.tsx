import { useState } from 'react';
import { useProjectMilestones } from '@/hooks/useProjectMilestones';

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

interface Project {
  id: string;
}

interface MilestoneListProps {
  project: Project;
}

export const MilestoneList = ({ project }: MilestoneListProps) => {
  const { milestones, isLoading, error, addMilestone, updateMilestone, deleteMilestone } = useProjectMilestones(project.id);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'PENDING' as const
  });

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMilestone(newMilestone);
      setNewMilestone({
        title: '',
        description: '',
        dueDate: '',
        status: 'PENDING'
      });
    } catch (error) {
      console.error('Failed to add milestone:', error);
    }
  };

  if (isLoading) return <div>Loading milestones...</div>;
  if (error) return <div>Error loading milestones</div>;

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddMilestone} className="space-y-4">
        <div>
          <input
            type="text"
            value={newMilestone.title}
            onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
            placeholder="Milestone title"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <textarea
            value={newMilestone.description}
            onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
            placeholder="Milestone description"
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div className="flex space-x-4">
          <input
            type="date"
            value={newMilestone.dueDate}
            onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
            className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Milestone
          </button>
        </div>
      </form>

      <div className="mt-6">
        <ul className="divide-y divide-gray-200">
          {milestones.map((milestone) => (
            <li key={milestone.id} className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{milestone.title}</h4>
                  <p className="mt-1 text-sm text-gray-500">{milestone.description}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={milestone.status}
                    onChange={(e) => updateMilestone(milestone.id, { ...milestone, status: e.target.value as Milestone['status'] })}
                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  <button
                    onClick={() => deleteMilestone(milestone.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}; 