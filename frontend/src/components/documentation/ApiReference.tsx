import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormattedEndpoint, FormattedSchema } from '@/types/documentation.types';

interface ApiReferenceProps {
  endpoints?: FormattedEndpoint[];
  schemas?: FormattedSchema[];
}

export const ApiReference = ({ endpoints, schemas }: ApiReferenceProps) => {
  if (!endpoints || !schemas) return null;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold mb-6">API Reference</h1>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Endpoints</h2>
        <div className="space-y-6">
          {endpoints.map((endpoint, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{endpoint.path}</CardTitle>
                  <Badge variant="outline">{endpoint.method}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{endpoint.description}</p>

                {endpoint.parameters.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Parameters</h3>
                    <div className="space-y-2">
                      {endpoint.parameters.map((param, paramIndex) => (
                        <div key={paramIndex} className="flex items-start">
                          <code className="bg-gray-100 px-2 py-1 rounded mr-2">
                            {param.name}
                          </code>
                          <span className="text-gray-600">{param.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Responses</h3>
                  <div className="space-y-2">
                    {endpoint.responses.map((response, responseIndex) => (
                      <div key={responseIndex} className="flex items-start">
                        <Badge variant="secondary" className="mr-2">
                          {response.status}
                        </Badge>
                        <span className="text-gray-600">{response.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {endpoint.examples.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Examples</h3>
                    <div className="space-y-4">
                      {endpoint.examples.map((example, exampleIndex) => (
                        <div key={exampleIndex}>
                          <h4 className="font-medium mb-2">Request</h4>
                          <pre className="bg-gray-100 p-4 rounded-md mb-4">
                            <code>{JSON.stringify(example.request, null, 2)}</code>
                          </pre>
                          <h4 className="font-medium mb-2">Response</h4>
                          <pre className="bg-gray-100 p-4 rounded-md">
                            <code>{JSON.stringify(example.response, null, 2)}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Schemas</h2>
        <div className="space-y-6">
          {schemas.map((schema, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{schema.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{schema.description}</p>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Properties</h3>
                  <div className="space-y-2">
                    {schema.properties.map((prop, propIndex) => (
                      <div key={propIndex} className="flex items-start">
                        <code className="bg-gray-100 px-2 py-1 rounded mr-2">
                          {prop.name}
                        </code>
                        <span className="text-gray-600">{prop.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Example</h3>
                  <pre className="bg-gray-100 p-4 rounded-md">
                    <code>{JSON.stringify(schema.example, null, 2)}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}; 