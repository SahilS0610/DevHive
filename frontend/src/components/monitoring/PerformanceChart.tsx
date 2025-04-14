import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceChartProps {
  data?: {
    timestamps: string[];
    responseTime: number[];
    throughput: number[];
  };
  timeRange: string;
}

export const PerformanceChart = ({ data, timeRange }: PerformanceChartProps) => {
  if (!data) return null;

  const chartData = {
    labels: data.timestamps,
    datasets: [
      {
        label: 'Response Time (ms)',
        data: data.responseTime,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Throughput (req/s)',
        data: data.throughput,
        borderColor: 'rgb(53, 162, 235)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Performance Metrics (${timeRange})`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
}; 