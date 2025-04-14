export interface PipelineConfig {
  version: string;
  stages: {
    build: StageConfig;
    test: StageConfig;
    security: StageConfig;
    deploy: DeployStageConfig;
  };
  notifications: NotificationConfig;
  monitoring: MonitoringConfig;
  rollback: RollbackConfig;
}

export interface StageConfig {
  steps: Step[];
}

export interface Step {
  name: string;
  command: string;
  timeout?: string;
  cache?: CacheConfig;
  artifacts?: string[];
  environment?: Record<string, string>;
  services?: string[];
  coverage?: CoverageConfig;
  allow_failure?: boolean;
}

export interface CacheConfig {
  key: string;
  paths: string[];
}

export interface CoverageConfig {
  reports: string[];
  threshold: number;
}

export interface DeployStageConfig {
  environments: {
    [key: string]: EnvironmentConfig;
  };
}

export interface EnvironmentConfig {
  url: string;
  variables: Record<string, string>;
  deployment: DeploymentConfig;
}

export interface DeploymentConfig {
  strategy: 'rolling' | 'blue-green' | 'canary';
  health_check: HealthCheckConfig;
  rollback?: RollbackConfig;
}

export interface HealthCheckConfig {
  path: string;
  interval: string;
  timeout: string;
  retries: number;
}

export interface NotificationConfig {
  slack: {
    channel: string;
    events: string[];
    template: {
      success: string;
      failure: string;
      rollback: string;
    };
  };
  email: {
    recipients: string[];
    events: string[];
    template: {
      subject: string;
      body: string;
    };
  };
}

export interface MonitoringConfig {
  metrics: {
    enabled: boolean;
    providers: string[];
    endpoints: string[];
  };
  logging: {
    level: string;
    format: string;
    retention: string;
  };
  tracing: {
    enabled: boolean;
    provider: string;
    sample_rate: number;
  };
}

export interface RollbackConfig {
  enabled: boolean;
  strategy: 'versioned' | 'snapshot';
  retention: {
    versions: number;
    days: number;
  };
} 