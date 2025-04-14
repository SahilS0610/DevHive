import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Github, Award, Users, Rocket, Trophy } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const submissionSchema = z.object({
  repositoryUrl: z.string().url('Please enter a valid repository URL'),
  branchName: z.string().min(1, 'Branch name is required'),
  teamContributions: z.array(z.object({
    userId: z.string(),
    contribution: z.string(),
    percentage: z.number().min(0).max(100)
  })),
  accomplishments: z.array(z.string())
});

export const ProjectSubmissionForm = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(submissionSchema)
  });

  const onSubmit = async (data: z.infer<typeof submissionSchema>) => {
    // Handle submission
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Project Completion Submission</h2>
            <p className="text-blue-100">
              Submit your project for validation and earn rewards for your team!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/10">
              <Rocket className="h-4 w-4 mr-1" />
              XP Boost Available
            </Badge>
            <Badge variant="secondary" className="bg-white/10">
              <Trophy className="h-4 w-4 mr-1" />
              Achievement Unlocked
            </Badge>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-b-xl shadow-lg p-8">
        <div className="mb-6">
          <Progress value={75} className="h-2" />
          <p className="text-sm text-gray-500 mt-2">75% of team members have contributed</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Repository Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                Repository Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Team Contributions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Contributions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TeamContributionForm
                control={control}
                teamMembers={projectTeamMembers}
              />
            </CardContent>
          </Card>

          {/* Project Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Key Accomplishments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AccomplishmentsList
                control={control}
                name="accomplishments"
              />
            </CardContent>
          </Card>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isSubmitting}
            >
              Submit for Validation
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}; 