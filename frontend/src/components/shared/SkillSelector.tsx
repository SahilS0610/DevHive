import { Control, Controller } from 'react-hook-form';
import { MultiSelect } from 'react-multi-select-component';

interface SkillSelectorProps {
  control: Control<any>;
  name: string;
  label: string;
}

const skillOptions = [
  { label: 'React', value: 'react' },
  { label: 'Node.js', value: 'nodejs' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'Docker', value: 'docker' },
  { label: 'AWS', value: 'aws' },
  // Add more skills as needed
];

export const SkillSelector = ({ control, name, label }: SkillSelectorProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <MultiSelect
              options={skillOptions}
              value={value || []}
              onChange={onChange}
              labelledBy={label}
              className="mt-1"
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error.message}</p>
            )}
          </>
        )}
      />
    </div>
  );
}; 