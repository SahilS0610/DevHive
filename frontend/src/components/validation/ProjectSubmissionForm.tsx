import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Github, Award, Users } from 'lucide-react';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TeamContributionForm } from './TeamContributionForm';
import { AccomplishmentsList } from './AccomplishmentsList';

const submissionSchema = z.object({
  repositoryUrl: z.string().url('Please enter a valid repository URL'),
  branchName: z.string().min(1, 'Branch name is required'),
  accomplishments: z.array(z.string()).min(1, 'At least one accomplishment is required'),
  teamContributions: z.array(z.object({
    memberId: z.string(),
    contribution: z.string().min(1, 'Contribution description is required')
  }))
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

export const ProjectSubmissionForm = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema)
  });

  const onSubmit = async (data: SubmissionFormData) => {
    try {
      // TODO: Implement submission logic
      console.log('Submitting project:', data);
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Project Completion Submission</h2>
        <p className="text-blue-100">
          Submit your project for validation and earn rewards for your team!
        </p>
      </div>

      <div className="bg-white rounded-b-xl shadow-lg p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Repository Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Github className="h-5 w-5" />
              Repository Information
            </h3>
            
            <Input
              label="Repository URL"
              placeholder="https://github.com/username/repo"
              {...register('repositoryUrl')}
              error={errors.repositoryUrl?.message}
            />

            <Input
              label="Main Branch"
              placeholder="main"
              {...register('branchName')}
              error={errors.branchName?.message}
            />
          </div>

          {/* Team Contributions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Contributions
            </h3>
            
            <TeamContributionForm
              control={control}
              teamMembers={projectTeamMembers}
            />
          </div>

          {/* Project Achievements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Award className="h-5 w-5" />
              Key Accomplishments
            </h3>
            
            <AccomplishmentsList
              control={control}
              name="accomplishments"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={isSubmitting}
          >
            Submit for Validation
          </Button>
        </form>
      </div>
    </div>
  );
}; 