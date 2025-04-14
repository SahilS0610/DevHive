import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProjectSchema } from '@/schemas/project.schema';
import { SkillSelector } from '../shared/SkillSelector';
import { DateRangePicker } from '../shared/DateRangePicker';

export const ProjectForm = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(CreateProjectSchema)
  });

  const onSubmit = async (data: any) => {
    try {
      // API call to create project
    } catch (error) {
      // Error handling
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Project Title
        </label>
        <input
          {...register('title')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <SkillSelector
        control={control}
        name="requiredSkills"
        label="Required Skills"
      />

      <DateRangePicker
        control={control}
        startName="timeline.startDate"
        endName="timeline.endDate"
        label="Project Timeline"
      />

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
      >
        Create Project
      </button>
    </form>
  );
}; 