export interface ApiDocumentation {
  version: string;
  lastUpdated: Date;
  endpoints: FormattedEndpoint[];
  schemas: FormattedSchema[];
  examples: ApiExample[];
  security: SecurityDocumentation;
  gettingStarted: GettingStartedGuide;
  deployment: DeploymentGuide;
  maintenance: MaintenanceGuide;
  troubleshooting: TroubleshootingGuide;
}

export interface FormattedEndpoint {
  path: string;
  method: string;
  description: string;
  parameters: Parameter[];
  responses: Response[];
  security: SecurityRequirement[];
  examples: Example[];
}

export interface FormattedSchema {
  name: string;
  description: string;
  properties: SchemaProperty[];
  required: string[];
  example: any;
}

export interface ApiExample {
  endpoint: string;
  method: string;
  request: any;
  response: any;
}

export interface SecurityDocumentation {
  authentication: AuthenticationMethod[];
  authorization: AuthorizationRule[];
  bestPractices: string[];
}

export interface GettingStartedGuide {
  overview: string;
  prerequisites: string[];
  installation: InstallationStep[];
  configuration: ConfigurationStep[];
  quickStart: QuickStartGuide;
}

export interface DeploymentGuide {
  environments: EnvironmentConfig[];
  deploymentSteps: DeploymentStep[];
  scaling: ScalingGuide;
  monitoring: MonitoringConfig;
}

export interface MaintenanceGuide {
  backupProcedures: BackupStep[];
  updateProcedures: UpdateStep[];
  monitoring: MonitoringProcedure[];
  performanceOptimization: OptimizationStep[];
}

export interface TroubleshootingGuide {
  commonIssues: CommonIssue[];
  errorCodes: ErrorCode[];
  diagnosticTools: DiagnosticTool[];
  recoveryProcedures: RecoveryProcedure[];
} 