import { cn } from '@/lib/utils';

interface ProgressChartProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export const ProgressChart = ({ value, className, showLabel = false }: ProgressChartProps) => {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white">
              {percentage}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}; 