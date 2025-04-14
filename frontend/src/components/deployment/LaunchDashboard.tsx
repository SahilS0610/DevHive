import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Shield, Activity, LineChart } from 'lucide-react';
import { useLaunchStatus } from '@/hooks/useLaunchStatus';
import { LaunchControls } from './LaunchControls';
import { ReadinessCard } from './ReadinessCard';
import { BlockingIssuesList } from './BlockingIssuesList';
import { ChecklistFilters } from './ChecklistFilters';
import { ChecklistTable } from './ChecklistTable';

export const LaunchDashboard = () => {
  const { launchStatus, isLoading } = useLaunchStatus();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleLaunch = async () => {
    // Implementation for launch initiation
    console.log('Initiating launch...');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Launch Readiness
          </h2>
          <p className="text-sm text-gray-500">
            System launch preparation status
          </p>
        </div>
        <LaunchControls
          isReady={launchStatus?.ready}
          onInitiateLaunch={handleLaunch}
        />
      </div>

      {/* Readiness Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ReadinessCard
          title="System Health"
          status={launchStatus?.checklist.systemHealth}
          icon={<Server className="h-6 w-6" />}
        />
        <ReadinessCard
          title="Security"
          status={launchStatus?.checklist.security}
          icon={<Shield className="h-6 w-6" />}
        />
        <ReadinessCard
          title="Performance"
          status={launchStatus?.checklist.performance}
          icon={<Activity className="h-6 w-6" />}
        />
        <ReadinessCard
          title="Monitoring"
          status={launchStatus?.checklist.monitoring}
          icon={<LineChart className="h-6 w-6" />}
        />
      </div>

      {/* Blocking Issues */}
      {launchStatus?.blockingIssues.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">
              Blocking Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BlockingIssuesList
              issues={launchStatus.blockingIssues}
            />
          </CardContent>
        </Card>
      )}

      {/* Launch Checklist */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Launch Checklist</CardTitle>
          <ChecklistFilters
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        </CardHeader>
        <CardContent>
          <ChecklistTable
            items={launchStatus?.checklist}
            category={selectedCategory}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Recommendations */}
      {launchStatus?.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {launchStatus.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    rec.priority === 'high' ? 'bg-red-500' :
                    rec.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <div>
                    <h4 className="font-medium">{rec.category}</h4>
                    <p className="text-gray-600">{rec.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 