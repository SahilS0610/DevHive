import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'active' | 'acknowledged' | 'resolved';
  timestamp: string;
}

interface AlertsTableProps {
  alerts?: Alert[];
  isLoading: boolean;
  filters: {
    severity: string;
    status: string;
  };
}

export const AlertsTable = ({ alerts, isLoading, filters }: AlertsTableProps) => {
  const filteredAlerts = alerts?.filter(alert => {
    if (filters.severity !== 'all' && alert.severity !== filters.severity) {
      return false;
    }
    if (filters.status !== 'all' && alert.status !== filters.status) {
      return false;
    }
    return true;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Critical
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Warning
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Info
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'acknowledged':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!filteredAlerts?.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        No alerts found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredAlerts.map((alert) => (
          <TableRow key={alert.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                {getStatusIcon(alert.status)}
                <span className="capitalize">{alert.status}</span>
              </div>
            </TableCell>
            <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
            <TableCell className="font-medium">{alert.title}</TableCell>
            <TableCell className="text-gray-500">{alert.description}</TableCell>
            <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}; 