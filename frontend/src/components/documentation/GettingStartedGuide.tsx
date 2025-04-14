import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GettingStartedGuide as GettingStartedGuideType } from '@/types/documentation.types';

interface GettingStartedGuideProps {
  content?: GettingStartedGuideType;
}

export const GettingStartedGuide = ({ content }: GettingStartedGuideProps) => {
  if (!content) return null;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold mb-4">Getting Started</h1>
        <p className="text-gray-600 mb-6">{content.overview}</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Prerequisites</h2>
        <ul className="list-disc pl-6 space-y-2">
          {content.prerequisites.map((prerequisite, index) => (
            <li key={index} className="text-gray-600">{prerequisite}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Installation</h2>
        <div className="space-y-4">
          {content.installation.map((step, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Step {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{step.description}</p>
                {step.command && (
                  <pre className="mt-2 bg-gray-100 p-4 rounded-md">
                    <code>{step.command}</code>
                  </pre>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Configuration</h2>
        <div className="space-y-4">
          {content.configuration.map((step, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{step.description}</p>
                {step.example && (
                  <pre className="mt-2 bg-gray-100 p-4 rounded-md">
                    <code>{JSON.stringify(step.example, null, 2)}</code>
                  </pre>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Quick Start</h2>
        <div className="space-y-4">
          {content.quickStart.steps.map((step, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Step {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{step.description}</p>
                {step.code && (
                  <pre className="mt-2 bg-gray-100 p-4 rounded-md">
                    <code>{step.code}</code>
                  </pre>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}; 