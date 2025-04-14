import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ResourceUsageChartProps {
  data?: {
    timestamps: string[];
    cpu: number[];
    memory: number[];
    disk: number[];
  };
  timeRange: string;
}

export const ResourceUsageChart = ({ data, timeRange }: ResourceUsageChartProps) => {
  if (!data) return null;

  const chartData = {
    labels: data.timestamps,
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: data.cpu,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Memory Usage (%)',
        data: data.memory,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Disk Usage (%)',
        data: data.disk,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
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
        text: `Resource Usage (${timeRange})`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}; 