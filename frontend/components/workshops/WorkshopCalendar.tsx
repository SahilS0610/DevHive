import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { WorkshopCard } from './WorkshopCard';
import { format } from 'date-fns';
import { Workshop, WorkshopFilter } from '@/types/workshop.types';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, List, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DayWithIndicatorProps {
  date: Date;
  workshops: Workshop[];
}

const DayWithIndicator = ({ date, workshops }: DayWithIndicatorProps) => {
  const hasWorkshops = workshops.length > 0;
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <span>{format(date, 'd')}</span>
      {hasWorkshops && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        </div>
      )}
    </div>
  );
};

const ViewToggle = ({ current, onChange }: { 
  current: 'calendar' | 'list',
  onChange: (view: 'calendar' | 'list') => void 
}) => (
  <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
    <Button
      variant="ghost"
      size="sm"
      className={`px-3 ${current === 'calendar' ? 'bg-white shadow-sm' : ''}`}
      onClick={() => onChange('calendar')}
    >
      <LayoutGrid className="h-4 w-4 mr-1" />
      Calendar
    </Button>
    <Button
      variant="ghost"
      size="sm"
      className={`px-3 ${current === 'list' ? 'bg-white shadow-sm' : ''}`}
      onClick={() => onChange('list')}
    >
      <List className="h-4 w-4 mr-1" />
      List
    </Button>
  </div>
);

const FilterDropdown = () => (
  <Select
    placeholder="Filter Workshops"
    icon={<Filter className="h-4 w-4" />}
    options={[
      { label: 'All Workshops', value: 'all' },
      { label: 'Enrolled', value: 'enrolled' },
      { label: 'Upcoming', value: 'upcoming' },
      { label: 'Completed', value: 'completed' }
    ]}
  />
);

const DayWorkshops = ({ date, workshops }: { date: Date, workshops: Workshop[] }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-slate-800">
        Workshops on {format(date, 'MMMM d, yyyy')}
      </h3>
      {workshops.length > 0 && (
        <Badge variant="secondary">
          {workshops.length} workshop{workshops.length !== 1 ? 's' : ''}
        </Badge>
      )}
    </div>
    
    <AnimatePresence>
      {workshops.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center py-12 text-slate-500"
        >
          No workshops scheduled for this date
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {workshops.map(workshop => (
            <motion.div
              key={workshop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <WorkshopCard workshop={workshop} />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  </div>
);

const WorkshopList = ({ workshops }: { workshops: Workshop[] }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-slate-800">
        Upcoming Workshops
      </h3>
      <Badge variant="secondary">
        {workshops.length} workshop{workshops.length !== 1 ? 's' : ''}
      </Badge>
    </div>
    
    <div className="grid grid-cols-1 gap-4">
      {workshops.map(workshop => (
        <motion.div
          key={workshop.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <WorkshopCard workshop={workshop} />
        </motion.div>
      ))}
    </div>
  </div>
);

export const WorkshopCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [filter, setFilter] = useState<WorkshopFilter>({});

  // Mock functions - replace with actual data fetching
  const workshopsOnDate = (date: Date): Workshop[] => {
    return []; // Replace with actual workshop data
  };

  const getWorkshopsForDate = (date: Date): Workshop[] => {
    return []; // Replace with actual workshop data
  };

  const getAllUpcomingWorkshops = (): Workshop[] => {
    return []; // Replace with actual workshop data
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">
          Workshops & Sessions
        </h2>
        <div className="flex items-center space-x-2">
          <ViewToggle current={view} onChange={setView} />
          <FilterDropdown />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Calendar View */}
        <div className="col-span-12 lg:col-span-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-lg border shadow-sm"
            components={{
              DayContent: (props) => (
                <DayWithIndicator 
                  date={props.date} 
                  workshops={workshopsOnDate(props.date)}
                />
              ),
            }}
          />
        </div>

        {/* Workshop List */}
        <div className="col-span-12 lg:col-span-8">
          {view === 'calendar' ? (
            <DayWorkshops 
              date={selectedDate}
              workshops={getWorkshopsForDate(selectedDate)}
            />
          ) : (
            <WorkshopList 
              workshops={getAllUpcomingWorkshops()}
            />
          )}
        </div>
      </div>
    </div>
  );
}; 