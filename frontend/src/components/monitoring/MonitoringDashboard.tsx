import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeRangeSelector } from './TimeRangeSelector';
import { MetricCard } from './MetricCard';
import { PerformanceChart } from './PerformanceChart';
import { ResourceUsageChart } from './ResourceUsageChart';
import { AlertFilters } from './AlertFilters';
import { AlertsTable } from './AlertsTable';
import { useSystemMetrics } from '@/hooks/useSystemMetrics';

const getResourceStatus = (value?: number) => {
  if (!value) return 'neutral';
  if (value > 90) return 'critical';
  if (value > 70) return 'warning';
  return 'success';
};

const getPerformanceStatus = (value?: number) => {
  if (!value) return 'neutral';
  if (value > 1000) return 'critical';
  if (value > 500) return 'warning';
  return 'success';
};

const getErrorStatus = (value?: number) => {
  if (!value) return 'neutral';
  if (value > 5) return 'critical';
  if (value > 1) return 'warning';
  return 'success';
};

export const MonitoringDashboard = () => {
  const { metrics, isLoading } = useSystemMetrics();
  const [timeRange, setTimeRange] = useState('1h');
  const [alertFilters, setAlertFilters] = useState({
    severity: 'all',
    status: 'active',
  });

  const handleFilterChange = (filters: { severity: string; status: string }) => {
    setAlertFilters(filters);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            System Monitoring
          </h2>
          <p className="text-sm text-gray-500">
            Real-time system metrics and alerts
          </p>
        </div>
        <TimeRangeSelector
          value={timeRange}
          onChange={setTimeRange}
        />
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="CPU Usage"
          value={`${metrics?.cpu.usage}%`}
          trend={metrics?.cpu.trend}
          status={getResourceStatus(metrics?.cpu.usage)}
        />
        <MetricCard
          title="Memory"
          value={`${metrics?.memory.used}/${metrics?.memory.total}GB`}
          trend={metrics?.memory.trend}
          status={getResourceStatus(metrics?.memory.percentage)}
        />
        <MetricCard
          title="API Response"
          value={`${metrics?.api.responseTime}ms`}
          trend={metrics?.api.trend}
          status={getPerformanceStatus(metrics?.api.responseTime)}
        />
        <MetricCard
          title="Error Rate"
          value={`${metrics?.errors.rate}%`}
          trend={metrics?.errors.trend}
          status={getErrorStatus(metrics?.errors.rate)}
        />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart
              data={metrics?.performance}
              timeRange={timeRange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceUsageChart
              data={metrics?.resources}
              timeRange={timeRange}
            />
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Active Alerts</CardTitle>
          <AlertFilters
            onFilterChange={handleFilterChange}
          />
        </CardHeader>
        <CardContent>
          <AlertsTable
            alerts={metrics?.activeAlerts}
            isLoading={isLoading}
            filters={alertFilters}
          />
        </CardContent>
      </Card>
    </div>
  );
}; 