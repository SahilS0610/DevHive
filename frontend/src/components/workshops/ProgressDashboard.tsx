import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Target, Award, Clock, CheckCircle, TrendingUp, BarChart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StatCard = ({ title, value, icon, trend, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center text-xs text-muted-foreground">
        <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
        {trend}% from last month
      </div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

const AttendanceChart = ({ attendance }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="text-sm font-medium">Attendance Rate</h3>
      <Badge variant="outline">{attendance.rate}%</Badge>
    </div>
    <div className="space-y-2">
      {attendance.sessions.map((session, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Session {index + 1}</span>
            <span>{session.attendance}%</span>
          </div>
          <Progress value={session.attendance} />
        </div>
      ))}
    </div>
  </div>
);

const PerformanceMetrics = ({ metrics }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Assignment Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.assignmentCompletion}%</div>
          <Progress value={metrics.assignmentCompletion} className="mt-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Quiz Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.quizScores}%</div>
          <Progress value={metrics.quizScores} className="mt-2" />
        </CardContent>
      </Card>
    </div>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Skill Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {metrics.skills.map((skill, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{skill.name}</span>
                <span>{skill.progress}%</span>
              </div>
              <Progress value={skill.progress} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export const ProgressDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  const attendance = {
    rate: 85,
    sessions: [
      { attendance: 90 },
      { attendance: 85 },
      { attendance: 80 },
      { attendance: 95 },
      { attendance: 75 },
    ],
  };

  const metrics = {
    assignmentCompletion: 75,
    quizScores: 85,
    skills: [
      { name: 'React Fundamentals', progress: 80 },
      { name: 'State Management', progress: 65 },
      { name: 'Component Design', progress: 90 },
      { name: 'Testing', progress: 70 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Attendance Rate"
          value={`${attendance.rate}%`}
          icon={<Users className="h-6 w-6" />}
          trend={+5}
          description="Average attendance across all sessions"
        />
        <StatCard
          title="Completion Rate"
          value="75%"
          icon={<CheckCircle className="h-6 w-6" />}
          trend={+8}
          description="Workshop completion progress"
        />
        <StatCard
          title="Average Score"
          value="85%"
          icon={<Target className="h-6 w-6" />}
          trend={+3}
          description="Average score across all assessments"
        />
        <StatCard
          title="Time Spent"
          value="24h"
          icon={<Clock className="h-6 w-6" />}
          trend={+10}
          description="Total learning time"
        />
      </div>

      {/* Detailed Progress */}
      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Session Attendance</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant={selectedTimeframe === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTimeframe('week')}
                  >
                    Week
                  </Button>
                  <Button
                    variant={selectedTimeframe === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTimeframe('month')}
                  >
                    Month
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AttendanceChart attendance={attendance} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceMetrics metrics={metrics} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <BarChart className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Analytics Chart</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Skill Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <Award className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Skill Distribution Chart</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 