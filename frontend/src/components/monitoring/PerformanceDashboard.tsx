import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, BarChart } from '@/components/charts';
import { useMonitoring } from '@/hooks/useMonitoring';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Cpu, MemoryStick, HardDrive, Network, AlertTriangle } from 'lucide-react';

const TimeRangeSelector = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Select time range" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="1h">Last Hour</SelectItem>
      <SelectItem value="24h">Last 24 Hours</SelectItem>
      <SelectItem value="7d">Last 7 Days</SelectItem>
      <SelectItem value="30d">Last 30 Days</SelectItem>
    </SelectContent>
  </Select>
);

const MetricCard = ({ title, value, trend, status, icon: Icon }: {
  title: string;
  value: string;
  trend: number;
  status: 'healthy' | 'warning' | 'critical';
  icon: React.ElementType;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center text-xs text-muted-foreground">
        <span className={trend >= 0 ? 'text-green-500' : 'text-red-500'}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
        <span className="ml-1">from last period</span>
      </div>
      <Badge variant={status === 'healthy' ? 'default' : status === 'warning' ? 'warning' : 'destructive'} className="mt-2">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    </CardContent>
  </Card>
);

const ErrorList = ({ errors }: { errors: Array<{ timestamp: Date; type: string; message: string }> }) => (
  <div className="mt-4 space-y-2">
    {errors.map((error, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex items-start space-x-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20"
      >
        <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />
        <div>
          <div className="text-sm font-medium text-red-900 dark:text-red-100">
            {error.type}
          </div>
          <div className="text-xs text-red-700 dark:text-red-300">
            {error.message}
          </div>
          <div className="text-xs text-red-600 dark:text-red-400">
            {new Date(error.timestamp).toLocaleString()}
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

export const PerformanceDashboard = () => {
  const [timeRange, setTimeRange] = useState('1h');
  const { metrics, isLoading, error } = useMonitoring(timeRange);

  const getHealthStatus = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'healthy';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error loading metrics: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            System Performance
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time system metrics and performance monitoring
          </p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="CPU Usage"
          value={`${metrics?.cpu}%`}
          trend={metrics?.cpuTrend || 0}
          status={getHealthStatus(metrics?.cpu || 0, { warning: 70, critical: 90 })}
          icon={Cpu}
        />
        <MetricCard
          title="Memory Usage"
          value={`${metrics?.memory}%`}
          trend={metrics?.memoryTrend || 0}
          status={getHealthStatus(metrics?.memory || 0, { warning: 75, critical: 90 })}
          icon={MemoryStick}
        />
        <MetricCard
          title="API Response Time"
          value={`${metrics?.apiLatency}ms`}
          trend={metrics?.apiLatencyTrend || 0}
          status={getHealthStatus(metrics?.apiLatency || 0, { warning: 500, critical: 1000 })}
          icon={Clock}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Resource Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={metrics?.resourceUsage || []}
              xField="timestamp"
              yFields={['cpu', 'memory', 'disk']}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={metrics?.apiPerformance || []}
              xField="endpoint"
              yField="duration"
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Error Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Error Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={metrics?.errorRates || []}
            xField="timestamp"
            yFields={['api', 'database', 'resource']}
            height={200}
          />
          <ErrorList errors={metrics?.recentErrors || []} />
        </CardContent>
      </Card>
    </div>
  );
}; 