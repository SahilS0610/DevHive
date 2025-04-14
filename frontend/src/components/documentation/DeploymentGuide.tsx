import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeploymentGuide as DeploymentGuideType } from '@/types/documentation.types';

interface DeploymentGuideProps {
  content?: DeploymentGuideType;
}

export const DeploymentGuide = ({ content }: DeploymentGuideProps) => {
  if (!content) return null;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold mb-6">Deployment Guide</h1>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Environments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.environments.map((env, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{env.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{env.description}</p>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">URL:</span>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {env.url}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium">Branch:</span>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {env.branch}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Deployment Steps</h2>
        <div className="space-y-4">
          {content.deploymentSteps.map((step, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Step {index + 1}: {step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{step.description}</p>
                {step.commands && (
                  <div className="space-y-2">
                    {step.commands.map((cmd, cmdIndex) => (
                      <pre key={cmdIndex} className="bg-gray-100 p-4 rounded-md">
                        <code>{cmd}</code>
                      </pre>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Scaling</h2>
        <div className="space-y-4">
          {content.scaling.steps.map((step, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{step.description}</p>
                {step.configuration && (
                  <pre className="bg-gray-100 p-4 rounded-md">
                    <code>{JSON.stringify(step.configuration, null, 2)}</code>
                  </pre>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Monitoring</h2>
        <div className="space-y-4">
          {content.monitoring.metrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{metric.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{metric.description}</p>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Threshold:</span>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {metric.threshold}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium">Alert:</span>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {metric.alert}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}; 