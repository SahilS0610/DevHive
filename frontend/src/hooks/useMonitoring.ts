import { useState, useEffect } from 'react';
import axios from 'axios';

interface MonitoringMetrics {
  cpu: number;
  memory: number;
  disk: number;
  apiLatency: number;
  cpuTrend: number;
  memoryTrend: number;
  apiLatencyTrend: number;
  resourceUsage: Array<{
    timestamp: string;
    cpu: number;
    memory: number;
    disk: number;
  }>;
  apiPerformance: Array<{
    endpoint: string;
    duration: number;
  }>;
  errorRates: Array<{
    timestamp: string;
    api: number;
    database: number;
    resource: number;
  }>;
  recentErrors: Array<{
    timestamp: Date;
    type: string;
    message: string;
  }>;
}

export const useMonitoring = (timeRange: string) => {
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<MonitoringMetrics>('/api/monitoring/metrics', {
        params: { timeRange }
      });
      setMetrics(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchMetrics
  };
}; 