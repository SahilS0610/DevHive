import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AlertFiltersProps {
  onFilterChange: (filters: { severity: string; status: string }) => void;
}

export const AlertFilters = ({ onFilterChange }: AlertFiltersProps) => {
  const handleSeverityChange = (severity: string) => {
    onFilterChange({ severity, status: 'active' });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({ severity: 'all', status });
  };

  return (
    <div className="flex gap-2">
      <Select onValueChange={handleSeverityChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Severities</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="warning">Warning</SelectItem>
          <SelectItem value="info">Info</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="acknowledged">Acknowledged</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}; 