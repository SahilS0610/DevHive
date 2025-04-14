import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const TimeRangeSelector = ({ value, onChange }: TimeRangeSelectorProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select time range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="5m">Last 5 minutes</SelectItem>
        <SelectItem value="15m">Last 15 minutes</SelectItem>
        <SelectItem value="1h">Last hour</SelectItem>
        <SelectItem value="6h">Last 6 hours</SelectItem>
        <SelectItem value="24h">Last 24 hours</SelectItem>
        <SelectItem value="7d">Last 7 days</SelectItem>
      </SelectContent>
    </Select>
  );
}; 