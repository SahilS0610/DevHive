import { motion } from 'framer-motion';
import { Clock, CheckCircle, Timer, Star, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DataTable } from '@/components/ui/data-table';
import { validationColumns } from './validation-columns';

const StatsCard = ({ title, value, trend, icon, description }: {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  description?: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-xl shadow-lg p-6"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-blue-50 rounded-lg">{icon}</div>
      <Badge variant={trend >= 0 ? 'success' : 'destructive'}>
        {trend >= 0 ? '+' : ''}{trend}
      </Badge>
    </div>
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {description && (
      <p className="text-sm text-gray-500 mt-2">{description}</p>
    )}
  </motion.div>
);

export const ModeratorDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Pending Reviews"
          value={pendingCount}
          trend={+2}
          icon={<Clock className="h-6 w-6 text-blue-600" />}
          description="Projects waiting for validation"
        />
        <StatsCard
          title="Validated Today"
          value={validatedToday}
          trend={+5}
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          description="Successfully validated projects"
        />
        <StatsCard
          title="Average Response Time"
          value="1.5 days"
          trend={-0.5}
          icon={<Timer className="h-6 w-6 text-purple-600" />}
          description="Time to review projects"
        />
      </div>

      {/* Moderator Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Your Performance
            </CardTitle>
            <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">
              Level 3 Moderator
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Review Accuracy</span>
                <span className="text-sm font-medium">95%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">XP Progress</span>
                <span className="text-sm font-medium">2,500/3,000</span>
              </div>
              <Progress value={83} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Submissions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Pending Validations
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              {pendingSubmissions.length} Projects
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={validationColumns}
            data={pendingSubmissions}
          />
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <achievement.icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{achievement.title}</h4>
                    <p className="text-sm text-gray-500">{achievement.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 