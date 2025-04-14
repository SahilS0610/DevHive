import { SkillSelector } from '../shared/SkillSelector';
import { useForm, Controller } from 'react-hook-form';

interface ProjectFilters {
  status: string;
  skills: string[];
  search: string;
}

interface ProjectFiltersProps {
  filters: ProjectFilters;
  onChange: (filters: ProjectFilters) => void;
}

const PROJECT_STATUSES = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' }
];

export const ProjectFilters = ({ filters, onChange }: ProjectFiltersProps) => {
  const { register, control } = useForm({
    defaultValues: filters
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, status: e.target.value });
  };

  const handleSkillsChange = (skills: string[]) => {
    onChange({ ...filters, skills });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700">
          Search Projects
        </label>
        <input
          type="text"
          id="search"
          value={filters.search}
          onChange={handleSearchChange}
          placeholder="Search by title or description"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={filters.status}
          onChange={handleStatusChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {PROJECT_STATUSES.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      <Controller
        control={control}
        name="skills"
        render={({ field }) => (
          <SkillSelector
            control={control}
            name="skills"
            label="Filter by Skills"
            value={field.value}
            onChange={handleSkillsChange}
          />
        )}
      />
    </div>
  );
}; 