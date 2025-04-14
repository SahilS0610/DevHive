import { useState } from 'react';
import { MultiSelect } from 'react-multi-select-component';

interface ProjectFiltersProps {
  filters: {
    status: string;
    skills: string[];
    search: string;
  };
  onChange: (filters: {
    status: string;
    skills: string[];
    search: string;
  }) => void;
}

const availableSkills = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'React', value: 'react' },
  { label: 'Node.js', value: 'nodejs' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'SQL', value: 'sql' },
  { label: 'MongoDB', value: 'mongodb' },
];

export const ProjectFilters = ({ filters, onChange }: ProjectFiltersProps) => {
  const [selectedSkills, setSelectedSkills] = useState(
    availableSkills.filter(skill => filters.skills.includes(skill.value))
  );

  const handleSkillChange = (selected: any[]) => {
    setSelectedSkills(selected);
    onChange({
      ...filters,
      skills: selected.map(skill => skill.value)
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Search projects..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Skills
          </label>
          <MultiSelect
            options={availableSkills}
            value={selectedSkills}
            onChange={handleSkillChange}
            labelledBy="Select skills"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}; 