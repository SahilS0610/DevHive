import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: number;
  status: 'success' | 'warning' | 'critical' | 'neutral';
}

export const MetricCard = ({ title, value, trend, status }: MetricCardProps) => {
  const getTrendIcon = () => {
    if (!trend) return <Minus className="h-4 w-4" />;
    if (trend > 0) return <ArrowUp className="h-4 w-4" />;
    return <ArrowDown className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn('flex items-center gap-1', getStatusColor())}>
          {getTrendIcon()}
          {trend !== undefined && (
            <span className="text-xs">
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}; 