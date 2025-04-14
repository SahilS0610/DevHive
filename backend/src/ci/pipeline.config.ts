import { PipelineConfig } from './types/pipeline.types';

export const pipelineConfig: PipelineConfig = {
  version: '1.0',
  stages: {
    build: {
      steps: [
        {
          name: 'install-dependencies',
          command: 'npm ci',
          timeout: '10m',
          cache: {
            key: 'npm-{{ checksum "package-lock.json" }}',
            paths: ['node_modules']
          }
        },
        {
          name: 'build-application',
          command: 'npm run build',
          artifacts: ['dist/**/*'],
          environment: {
            NODE_ENV: 'production'
          }
        },
        {
          name: 'build-docker',
          command: 'docker build -t devhive:${CI_COMMIT_SHA} .',
          artifacts: ['docker-image']
        }
      ]
    },
    test: {
      steps: [
        {
          name: 'lint',
          command: 'npm run lint',
          timeout: '5m'
        },
        {
          name: 'unit-tests',
          command: 'npm run test:unit',
          coverage: {
            reports: ['lcov'],
            threshold: 80
          }
        },
        {
          name: 'integration-tests',
          command: 'npm run test:integration',
          environment: 'test',
          services: ['postgres', 'redis']
        },
        {
          name: 'e2e-tests',
          command: 'npm run test:e2e',
          environment: 'staging',
          artifacts: ['cypress/videos/**/*', 'cypress/screenshots/**/*']
        }
      ]
    },
    security: {
      steps: [
        {
          name: 'dependency-scan',
          command: 'npm audit',
          allow_failure: true
        },
        {
          name: 'code-scan',
          command: 'npm run security:scan',
          artifacts: ['security-report.json']
        }
      ]
    },
    deploy: {
      environments: {
        staging: {
          url: 'https://staging.devhive.com',
          variables: {
            NODE_ENV: 'staging',
            LOG_LEVEL: 'debug',
            API_URL: 'https://api.staging.devhive.com'
          },
          deployment: {
            strategy: 'rolling',
            health_check: {
              path: '/health',
              interval: '30s',
              timeout: '10s',
              retries: 3
            }
          }
        },
        production: {
          url: 'https://devhive.com',
          variables: {
            NODE_ENV: 'production',
            LOG_LEVEL: 'info',
            API_URL: 'https://api.devhive.com'
          },
          deployment: {
            strategy: 'blue-green',
            health_check: {
              path: '/health',
              interval: '30s',
              timeout: '10s',
              retries: 3
            },
            rollback: {
              enabled: true,
              timeout: '5m'
            }
          }
        }
      }
    }
  },
  notifications: {
    slack: {
      channel: 'deployments',
      events: ['success', 'failure', 'rollback'],
      template: {
        success: '🎉 Deployment to {environment} succeeded!',
        failure: '🚨 Deployment to {environment} failed!',
        rollback: '🔄 Rolling back deployment to {environment}'
      }
    },
    email: {
      recipients: ['devops@devhive.com'],
      events: ['failure', 'rollback'],
      template: {
        subject: 'Deployment {status} - {environment}',
        body: 'Deployment {status} for version {version}'
      }
    }
  },
  monitoring: {
    metrics: {
      enabled: true,
      providers: ['prometheus', 'datadog'],
      endpoints: ['/metrics']
    },
    logging: {
      level: 'info',
      format: 'json',
      retention: '30d'
    },
    tracing: {
      enabled: true,
      provider: 'jaeger',
      sample_rate: 0.1
    }
  },
  rollback: {
    enabled: true,
    strategy: 'versioned',
    retention: {
      versions: 5,
      days: 30
    }
  }
}; 