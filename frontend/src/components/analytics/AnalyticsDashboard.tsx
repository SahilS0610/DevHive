import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  BarChart,
  RadarChart,
  PieChart
} from '@/components/charts';
import { useAnalytics } from '@/hooks/useAnalytics';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Target,
  Users,
  TrendingUp,
  BookOpen,
  Clock,
  Award,
  BarChart2,
  PieChart as PieChartIcon
} from 'lucide-react';

const TimeframeSelector = ({ value, onChange }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Select timeframe" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="week">Last Week</SelectItem>
      <SelectItem value="month">Last Month</SelectItem>
      <SelectItem value="year">Last Year</SelectItem>
    </SelectContent>
  </Select>
);

const MetricCard = ({ title, value, trend, icon }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-lg shadow p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend >= 0 ? '+' : ''}{trend}% from last period
        </p>
      </div>
      <div className="p-3 bg-blue-50 rounded-full">
        {icon}
      </div>
    </div>
  </motion.div>
);

const TeamPerformanceAnalysis = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle>Team Performance Analysis</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Average Team Size</p>
            <p className="text-2xl font-bold">{data?.averageTeamSize}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Success Rate</p>
            <p className="text-2xl font-bold">{data?.successRate}%</p>
          </div>
        </div>
        <BarChart
          data={data?.topPerformingTeams}
          height={200}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
            },
          }}
        />
      </div>
    </CardContent>
  </Card>
);

const SkillGrowthAnalysis = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle>Skill Growth Analysis</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Growth Rate</p>
            <p className="text-2xl font-bold">{data?.growthRate}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Top Skills</p>
            <p className="text-2xl font-bold">{data?.topSkillsCount}</p>
          </div>
        </div>
        <RadarChart
          data={data?.skillDistribution}
          height={200}
        />
      </div>
    </CardContent>
  </Card>
);

export const AnalyticsDashboard = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const { data, isLoading } = useAnalytics(timeframe);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Timeframe Selection */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          DevHive Analytics
        </h1>
        <TimeframeSelector
          value={timeframe}
          onChange={setTimeframe}
        />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Project Success Rate"
          value={`${data?.projectMetrics.successRate}%`}
          trend={+5}
          icon={<Target className="h-6 w-6 text-blue-500" />}
        />
        <MetricCard
          title="Active Teams"
          value={data?.projectMetrics.teamPerformance.averageTeamSize}
          trend={+2}
          icon={<Users className="h-6 w-6 text-green-500" />}
        />
        <MetricCard
          title="Skill Growth"
          value={`${data?.skillMetrics.skillGrowthRate}%`}
          trend={+8}
          icon={<TrendingUp className="h-6 w-6 text-purple-500" />}
        />
        <MetricCard
          title="Workshop Impact"
          value={`${data?.skillMetrics.workshopImpact[0]?.skillImprovement}%`}
          trend={+3}
          icon={<BookOpen className="h-6 w-6 text-orange-500" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Completion Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={data?.projectMetrics.projectTrends}
              height={300}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart
              data={data?.skillMetrics.skillDistribution}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamPerformanceAnalysis data={data?.projectMetrics.teamPerformance} />
        <SkillGrowthAnalysis data={data?.skillMetrics} />
      </div>

      {/* Skill Gaps Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Gaps Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <BarChart
              data={data?.skillMetrics.skillGaps}
              height={300}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 