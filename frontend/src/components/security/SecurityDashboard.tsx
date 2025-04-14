import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Activity, Lock, Users, Globe, Clock } from 'lucide-react';
import { useSecurityMetrics } from '@/hooks/useSecurityMetrics';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, BarChart, PieChart } from '@/components/charts';

const TimeframeSelector = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Select timeframe" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="1h">Last Hour</SelectItem>
      <SelectItem value="24h">Last 24 Hours</SelectItem>
      <SelectItem value="7d">Last 7 Days</SelectItem>
      <SelectItem value="30d">Last 30 Days</SelectItem>
    </SelectContent>
  </Select>
);

const SecurityScoreCard = ({ score, trend, recommendations }: {
  score: number;
  trend: number;
  recommendations: Array<{ title: string; priority: 'high' | 'medium' | 'low' }>;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Shield className={`h-8 w-8 ${getScoreColor(score)}`} />
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Security Score
            </h3>
            <p className="text-3xl font-bold">
              {score}/100
            </p>
          </div>
        </div>
        <TrendIndicator value={trend} />
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Recommendations
        </h4>
        <ul className="mt-2 space-y-2">
          {recommendations?.map((rec, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-2"
            >
              <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'warning' : 'default'}>
                {rec.priority}
              </Badge>
              <span className="text-sm">{rec.title}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </CardContent>
  </Card>
);

const AlertsOverview = ({ alerts }: { alerts: Array<{ type: string; severity: string; timestamp: Date }> }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <span>Security Alerts</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {alerts?.map((alert, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/20"
          >
            <div>
              <div className="font-medium">{alert.type}</div>
              <div className="text-sm text-gray-500">
                {new Date(alert.timestamp).toLocaleString()}
              </div>
            </div>
            <Badge variant={alert.severity === 'high' ? 'destructive' : 'warning'}>
              {alert.severity}
            </Badge>
          </motion.div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const ActivitySummary = ({ activities }: { activities: Array<{ type: string; count: number; trend: number }> }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Activity className="h-5 w-5 text-blue-500" />
        <span>Activity Summary</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {activities?.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <span className="font-medium">{activity.type}</span>
              <Badge variant="outline">{activity.count}</Badge>
            </div>
            <TrendIndicator value={activity.trend} />
          </motion.div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const SecurityDashboard = () => {
  const [timeframe, setTimeframe] = useState('24h');
  const { metrics, isLoading, error } = useSecurityMetrics(timeframe);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error loading security metrics: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Security Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor and manage system security
          </p>
        </div>
        <TimeframeSelector value={timeframe} onChange={setTimeframe} />
      </div>

      {/* Security Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SecurityScoreCard
          score={metrics?.overallScore || 0}
          trend={metrics?.scoreTrend || 0}
          recommendations={metrics?.recommendations || []}
        />
        <AlertsOverview alerts={metrics?.recentAlerts || []} />
        <ActivitySummary activities={metrics?.recentActivities || []} />
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={metrics?.accessPatterns || []}
              xField="timestamp"
              yFields={['logins', 'apiCalls', 'resourceAccess']}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={metrics?.riskDistribution || []}
              nameField="category"
              valueField="count"
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Audit Log */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Audit Log</CardTitle>
          <Button variant="outline" size="sm">
            Export Logs
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Timestamp</th>
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">Action</th>
                  <th className="text-left py-2">Resource</th>
                  <th className="text-left py-2">Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {metrics?.auditLogs?.map((log, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="py-2">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-2">{log.userId}</td>
                    <td className="py-2">{log.action}</td>
                    <td className="py-2">{log.resource}</td>
                    <td className="py-2">
                      <Badge variant={log.riskScore > 80 ? 'destructive' : log.riskScore > 50 ? 'warning' : 'default'}>
                        {log.riskScore}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 50) return 'text-yellow-500';
  return 'text-red-500';
};

const TrendIndicator = ({ value }: { value: number }) => (
  <div className={`flex items-center ${value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
    {value >= 0 ? '↑' : '↓'} {Math.abs(value)}%
  </div>
); 