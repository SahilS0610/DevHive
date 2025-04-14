import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWorkshops } from '@/hooks/useWorkshops';
import { BookOpen, Users, FileText, Target, Calendar, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StatCard = ({ title, value, icon, trend }) => (
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
    </CardContent>
  </Card>
);

const WorkshopCard = ({ workshop }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">{workshop.title}</CardTitle>
        <Badge variant={workshop.status === 'in_progress' ? 'default' : 'secondary'}>
          {workshop.status}
        </Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span>{workshop.currentParticipants} / {workshop.maxParticipants}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span>{workshop.sessions.length} sessions</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{workshop.completionRate}%</span>
          </div>
          <Progress value={workshop.completionRate} />
        </div>
        <div className="flex justify-between">
          <Button variant="outline" size="sm">
            View Details
          </Button>
          <Button size="sm">
            Join Workshop
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const WorkshopCalendar = ({ workshops }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {selectedDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium">
            {day}
          </div>
        ))}
        {Array.from({ length: 35 }).map((_, index) => {
          const date = new Date(selectedDate);
          date.setDate(1);
          date.setDate(date.getDate() - date.getDay() + index);
          
          const hasWorkshop = workshops.some(workshop => 
            workshop.sessions.some(session => 
              new Date(session.date).toDateString() === date.toDateString()
            )
          );

          return (
            <motion.div
              key={index}
              className={`p-2 text-center rounded-lg cursor-pointer ${
                hasWorkshop ? 'bg-blue-50' : ''
              }`}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedDate(date)}
            >
              <div className="text-sm">{date.getDate()}</div>
              {hasWorkshop && (
                <div className="w-1 h-1 rounded-full bg-blue-500 mx-auto mt-1" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export const WorkshopDashboard = () => {
  const { workshops, isLoading } = useWorkshops();
  
  const calculateCompletionRate = (workshops) => {
    if (!workshops?.length) return 0;
    const total = workshops.reduce((acc, w) => acc + w.completionRate, 0);
    return Math.round(total / workshops.length);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Active Workshops"
          value={workshops?.filter(w => w.status === 'in_progress').length}
          icon={<BookOpen className="h-6 w-6" />}
          trend={+2}
        />
        <StatCard
          title="Total Participants"
          value={workshops?.reduce((acc, w) => acc + w.currentParticipants, 0)}
          icon={<Users className="h-6 w-6" />}
          trend={+15}
        />
        <StatCard
          title="Resources Shared"
          value={workshops?.reduce((acc, w) => acc + w.resources.length, 0)}
          icon={<FileText className="h-6 w-6" />}
          trend={+5}
        />
        <StatCard
          title="Avg. Completion Rate"
          value={`${calculateCompletionRate(workshops)}%`}
          icon={<Target className="h-6 w-6" />}
          trend={+3}
        />
      </div>

      {/* Workshop Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkshopCalendar workshops={workshops} />
        </CardContent>
      </Card>

      {/* Active Workshops */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Workshops</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops
              ?.filter(w => w.status === 'in_progress')
              .map(workshop => (
                <WorkshopCard
                  key={workshop.id}
                  workshop={workshop}
                />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops
              ?.filter(w => w.status === 'upcoming')
              .map(workshop => (
                <WorkshopCard
                  key={workshop.id}
                  workshop={workshop}
                />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops
              ?.filter(w => w.status === 'completed')
              .map(workshop => (
                <WorkshopCard
                  key={workshop.id}
                  workshop={workshop}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 