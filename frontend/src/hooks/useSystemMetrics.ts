import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface SystemMetrics {
  cpu: {
    usage: number;
    trend: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
    trend: number;
  };
  api: {
    responseTime: number;
    trend: number;
  };
  errors: {
    rate: number;
    trend: number;
  };
  performance: {
    timestamps: string[];
    responseTime: number[];
    throughput: number[];
  };
  resources: {
    timestamps: string[];
    cpu: number[];
    memory: number[];
    disk: number[];
  };
  activeAlerts: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
    status: 'active' | 'acknowledged' | 'resolved';
    timestamp: string;
  }>;
}

export const useSystemMetrics = (timeRange: string = '1h') => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['systemMetrics', timeRange],
    queryFn: async () => {
      const response = await api.get(`/monitoring/metrics?timeRange=${timeRange}`);
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    if (data) {
      setMetrics(data);
    }
  }, [data]);

  return {
    metrics,
    isLoading,
    error,
  };
}; 