export interface SystemMetrics {
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