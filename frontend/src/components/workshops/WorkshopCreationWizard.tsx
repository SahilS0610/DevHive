import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkshopCreation } from '@/hooks/useWorkshopCreation';
import { BookOpen, Calendar, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const StepIndicator = ({ step, current, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center ${
      step.id <= current ? 'text-blue-600' : 'text-gray-400'
    }`}
  >
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
        step.id <= current
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-300 bg-white'
      }`}
    >
      {step.id < current ? (
        <CheckCircle className="w-6 h-6" />
      ) : (
        <span className="font-medium">{step.id}</span>
      )}
    </div>
    <span className="mt-2 text-sm font-medium">{step.title}</span>
  </button>
);

const BasicInformationStep = ({ form, onNext }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div>
      <h3 className="text-lg font-semibold mb-4">Workshop Details</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input
            {...form.register('title')}
            placeholder="Enter workshop title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            {...form.register('description')}
            placeholder="Describe your workshop"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Prerequisites</label>
          <Input
            {...form.register('prerequisites')}
            placeholder="Enter prerequisites (comma separated)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Learning Outcomes</label>
          <Textarea
            {...form.register('learningOutcomes')}
            placeholder="List the learning outcomes"
            rows={4}
          />
        </div>
      </div>
    </div>
    <div className="flex justify-end">
      <Button onClick={onNext}>Next</Button>
    </div>
  </motion.div>
);

const ScheduleStep = ({ form, onBack, onNext }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div>
      <h3 className="text-lg font-semibold mb-4">Schedule & Sessions</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Input
              type="datetime-local"
              {...form.register('startDate')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Input
              type="datetime-local"
              {...form.register('endDate')}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Participants</label>
          <Input
            type="number"
            {...form.register('maxParticipants')}
            min={1}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Session Schedule</label>
          <div className="space-y-2">
            {form.watch('sessions')?.map((session, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Session {index + 1}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(session.date).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const sessions = form.getValues('sessions');
                      form.setValue(
                        'sessions',
                        sessions.filter((_, i) => i !== index)
                      );
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                const sessions = form.getValues('sessions') || [];
                form.setValue('sessions', [
                  ...sessions,
                  { date: new Date(), duration: 60 },
                ]);
              }}
            >
              Add Session
            </Button>
          </div>
        </div>
      </div>
    </div>
    <div className="flex justify-between">
      <Button variant="outline" onClick={onBack}>
        Back
      </Button>
      <Button onClick={onNext}>Next</Button>
    </div>
  </motion.div>
);

const ResourcesStep = ({ form, onBack, onNext }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div>
      <h3 className="text-lg font-semibold mb-4">Resources & Materials</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Add Resources</label>
          <div className="space-y-2">
            {form.watch('resources')?.map((resource, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{resource.title}</h4>
                    <p className="text-sm text-gray-500">{resource.type}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const resources = form.getValues('resources');
                      form.setValue(
                        'resources',
                        resources.filter((_, i) => i !== index)
                      );
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                const resources = form.getValues('resources') || [];
                form.setValue('resources', [
                  ...resources,
                  { title: '', type: 'document', url: '' },
                ]);
              }}
            >
              Add Resource
            </Button>
          </div>
        </div>
      </div>
    </div>
    <div className="flex justify-between">
      <Button variant="outline" onClick={onBack}>
        Back
      </Button>
      <Button onClick={onNext}>Next</Button>
    </div>
  </motion.div>
);

const ReviewStep = ({ form, onBack, onSubmit, isSubmitting }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div>
      <h3 className="text-lg font-semibold mb-4">Review & Publish</h3>
      <div className="space-y-6">
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Workshop Details</h4>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Title</p>
              <p className="font-medium">{form.watch('title')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium">{form.watch('description')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Schedule</p>
              <p className="font-medium">
                {new Date(form.watch('startDate')).toLocaleDateString()} -{' '}
                {new Date(form.watch('endDate')).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Max Participants</p>
              <p className="font-medium">{form.watch('maxParticipants')}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-4">Resources</h4>
          <div className="space-y-2">
            {form.watch('resources')?.map((resource, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{resource.title}</p>
                  <p className="text-sm text-gray-500">{resource.type}</p>
                </div>
                <Badge variant="outline">{resource.type}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
    <div className="flex justify-between">
      <Button variant="outline" onClick={onBack}>
        Back
      </Button>
      <Button onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Publishing...' : 'Publish Workshop'}
      </Button>
    </div>
  </motion.div>
);

export const WorkshopCreationWizard = () => {
  const [step, setStep] = useState(1);
  const { form, isSubmitting, onSubmit } = useWorkshopCreation();

  const steps = [
    { id: 1, title: 'Basic Information', icon: BookOpen },
    { id: 2, title: 'Schedule & Sessions', icon: Calendar },
    { id: 3, title: 'Resources & Materials', icon: FileText },
    { id: 4, title: 'Review & Publish', icon: CheckCircle },
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
      {/* Progress Bar */}
      <div className="px-8 pt-6">
        <div className="relative">
          <div className="absolute left-0 top-1/2 h-0.5 w-full bg-gray-200">
            <motion.div
              className="absolute left-0 top-0 h-full bg-blue-600"
              style={{ width: `${(step / steps.length) * 100}%` }}
            />
          </div>
          <div className="relative flex justify-between">
            {steps.map((s) => (
              <StepIndicator
                key={s.id}
                step={s}
                current={step}
                onClick={() => setStep(s.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <BasicInformationStep
              form={form}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <ScheduleStep
              form={form}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <ResourcesStep
              form={form}
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <ReviewStep
              form={form}
              onBack={() => setStep(3)}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}; 