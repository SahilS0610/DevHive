import { Control, Controller } from 'react-hook-form';
import { MultiSelect } from 'react-multi-select-component';

interface SkillSelectorProps {
  control: Control<any>;
  name: string;
  label: string;
}

export const SkillSelector = ({ control, name, label }: SkillSelectorProps) => {
  // This would typically come from an API or context
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

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <MultiSelect
            options={availableSkills}
            value={value || []}
            onChange={onChange}
            labelledBy="Select skills"
            className="mt-1"
          />
        )}
      />
    </div>
  );
}; 