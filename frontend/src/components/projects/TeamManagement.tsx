import { useState } from 'react';
import { useProjectMembers } from '@/hooks/useProjectMembers';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  skills: string[];
}

interface Project {
  id: string;
  currentMembers: number;
  maxMembers: number;
}

interface TeamManagementProps {
  project: Project;
}

export const TeamManagement = ({ project }: TeamManagementProps) => {
  const { members, isLoading, error, addMember, removeMember, updateRole } = useProjectMembers(project.id);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('MEMBER');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (project.currentMembers >= project.maxMembers) {
      alert('Project has reached maximum member limit');
      return;
    }
    try {
      await addMember(newMemberEmail, newMemberRole);
      setNewMemberEmail('');
      setNewMemberRole('MEMBER');
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  if (isLoading) return <div>Loading team members...</div>;
  if (error) return <div>Error loading team members</div>;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-500">Team Members</h4>
        <p className="mt-1 text-sm text-gray-900">
          {project.currentMembers}/{project.maxMembers} members
        </p>
      </div>

      <form onSubmit={handleAddMember} className="flex space-x-4">
        <div className="flex-1">
          <input
            type="email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            placeholder="Enter member email"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div className="w-48">
          <select
            value={newMemberRole}
            onChange={(e) => setNewMemberRole(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="MEMBER">Member</option>
            <option value="LEAD">Lead</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Member
        </button>
      </form>

      <div className="mt-6">
        <ul className="divide-y divide-gray-200">
          {members.map((member) => (
            <li key={member.id} className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={member.role}
                    onChange={(e) => updateRole(member.id, e.target.value)}
                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="LEAD">Lead</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button
                    onClick={() => removeMember(member.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {member.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}; 