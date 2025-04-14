import { motion } from 'framer-motion';
import { Clock, Users, Tag, Bookmark } from 'lucide-react';
import { format } from 'date-fns';
import { Workshop } from '@/types/workshop.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface WorkshopCardProps {
  workshop: Workshop;
  variant?: 'default' | 'compact';
}

const StatusBadge = ({ status }: { status: Workshop['status'] }) => {
  const variants = {
    upcoming: 'bg-blue-100 text-blue-700',
    ongoing: 'bg-green-100 text-green-700',
    completed: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <span className={cn(
      'px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[status]
    )}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Detail = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div className="flex items-center text-sm text-slate-600">
    <Icon className="h-4 w-4 mr-2" />
    <span>{text}</span>
  </div>
);

export const WorkshopCard = ({ workshop, variant = 'default' }: WorkshopCardProps) => {
  const handleEnrollment = async (workshopId: string) => {
    // Implement enrollment logic
    console.log('Enrolling in workshop:', workshopId);
  };

  const saveWorkshop = async (workshopId: string) => {
    // Implement save/bookmark logic
    console.log('Saving workshop:', workshopId);
  };

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white rounded-lg border border-slate-100 p-4 hover:shadow-sm transition-shadow"
      >
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <Avatar src={workshop.instructor.avatar} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 truncate">
              {workshop.title}
            </h3>
            <p className="text-xs text-slate-500">
              {format(workshop.startDate, 'MMM d, h:mm a')}
            </p>
          </div>
          <StatusBadge status={workshop.status} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group relative bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
    >
      {/* Workshop Status Badge */}
      <div className="absolute top-4 right-4">
        <StatusBadge status={workshop.status} />
      </div>

      {/* Workshop Cover */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500 relative">
        <img
          src={workshop.coverImage}
          alt={workshop.title}
          className="w-full h-full object-cover mix-blend-overlay"
        />
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center space-x-2">
            <Avatar src={workshop.instructor.avatar} />
            <span className="text-white font-medium">
              {workshop.instructor.name}
            </span>
          </div>
        </div>
      </div>

      {/* Workshop Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          {workshop.title}
        </h3>
        <p className="text-slate-600 text-sm mb-4">
          {workshop.description}
        </p>

        {/* Workshop Details */}
        <div className="space-y-2 mb-4">
          <Detail icon={Clock} text={format(workshop.startDate, 'PPp')} />
          <Detail icon={Users} text={`${workshop.enrolledCount}/${workshop.maxSeats} seats`} />
          <Detail icon={Tag} text={workshop.category} />
        </div>

        {/* Prerequisites */}
        {workshop.prerequisites.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-800 mb-2">Prerequisites</h4>
            <div className="flex flex-wrap gap-2">
              {workshop.prerequisites.map((prereq, index) => (
                <Badge key={index} variant="secondary">
                  {prereq}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 mt-6">
          <Button
            variant={workshop.isEnrolled ? 'outline' : 'default'}
            className="w-full"
            onClick={() => handleEnrollment(workshop.id)}
          >
            {workshop.isEnrolled ? 'Enrolled' : 'Enroll Now'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => saveWorkshop(workshop.id)}
          >
            <Bookmark className={cn(
              "h-4 w-4",
              workshop.isSaved && "fill-current"
            )} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}; 