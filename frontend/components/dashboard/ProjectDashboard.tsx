import { motion } from 'framer-motion';
import { Calendar, Users, Award, Clock, ChevronRight } from 'lucide-react';
import { ProjectCard } from '../projects/ProjectCard';
import { ProgressChart } from '../shared/ProgressChart';
import { StatsCardProps, Project, Deadline, Skill, TimelineItem } from '@/types/dashboard.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// Mock data - replace with actual data fetching
const activeProjects: Project[] = [
  {
    id: '1',
    title: 'AI Research Project',
    description: 'Machine Learning for Natural Language Processing',
    status: 'active',
    progress: 75,
    members: 4,
    deadline: new Date('2024-06-15'),
    role: 'leader'
  },
  // Add more projects...
];

const deadlines: TimelineItem[] = [
  {
    id: '1',
    title: 'Project Proposal Submission',
    date: new Date('2024-05-20'),
    description: 'Submit final project proposal',
    type: 'project',
    status: 'upcoming'
  },
  // Add more deadlines...
];

const userSkills: Skill[] = [
  {
    id: '1',
    name: 'Machine Learning',
    level: 'advanced',
    progress: 85,
    verified: true
  },
  // Add more skills...
];

export const ProjectDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-600">Welcome back! Here's your academic overview.</p>
      </div>

      {/* Top Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={<Users className="h-6 w-6 text-blue-600" />}
          title="Active Projects"
          value="3"
          subtitle="2 as Leader, 1 as Member"
        />
        <StatsCard
          icon={<Calendar className="h-6 w-6 text-emerald-600" />}
          title="Workshop Hours"
          value="24"
          subtitle="This Semester"
        />
        <StatsCard
          icon={<Award className="h-6 w-6 text-purple-600" />}
          title="Skills Verified"
          value="8"
          subtitle="+3 In Progress"
        />
        <StatsCard
          icon={<Clock className="h-6 w-6 text-amber-600" />}
          title="Upcoming Deadlines"
          value="5"
          subtitle="Next 7 Days"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Active Projects */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800">Active Projects</h2>
              <Button variant="ghost" className="text-blue-600">
                View All <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {activeProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  variant="dashboard"
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Upcoming Deadlines */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Upcoming Deadlines</h2>
            <div className="space-y-4">
              {deadlines.map(deadline => (
                <div key={deadline.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      deadline.status === 'upcoming' ? 'bg-blue-500' :
                      deadline.status === 'completed' ? 'bg-emerald-500' :
                      'bg-red-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{deadline.title}</p>
                    <p className="text-xs text-slate-500">
                      {format(deadline.date, 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Skill Progress */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Skill Progress</h2>
            <div className="space-y-4">
              {userSkills.map(skill => (
                <div key={skill.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800">{skill.name}</span>
                    <Badge variant={skill.verified ? "default" : "secondary"}>
                      {skill.level}
                    </Badge>
                  </div>
                  <ProgressChart
                    value={skill.progress}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ icon, title, value, subtitle }: StatsCardProps) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"
  >
    <div className="flex items-center space-x-4">
      <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  </motion.div>
); 