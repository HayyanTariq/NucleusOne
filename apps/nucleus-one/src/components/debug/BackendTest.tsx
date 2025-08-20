import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ApiService } from '@/store/nucleusStore';

const BackendTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    connection: boolean | null;
    registration: boolean | null;
    error?: string;
  }>({
    connection: null,
    registration: null,
  });

  const testBackendConnection = async () => {
    setIsTesting(true);
    setTestResults({ connection: null, registration: null });

    try {
      // Test basic connection
      const isConnected = await ApiService.testBackendConnection();
      setTestResults(prev => ({ ...prev, connection: isConnected }));

      if (isConnected) {
        // Test registration endpoint
        try {
          const testData = {
            companyName: 'Test Company',
            ownerName: 'Test Owner',
            ownerEmail: 'test@test.com',
            ownerPassword: 'Test123!'
          };

          const response = await ApiService.registerCompany(testData);
          setTestResults(prev => ({ 
            ...prev, 
            registration: response.success,
            error: response.success ? undefined : response.message
          }));
        } catch (regError) {
          setTestResults(prev => ({ 
            ...prev, 
            registration: false,
            error: regError instanceof Error ? regError.message : 'Registration test failed'
          }));
        }
      }
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        connection: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      }));
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusColor = (status: boolean | null) => {
    if (status === null) return 'secondary';
    return status ? 'default' : 'destructive';
  };

  const getStatusText = (status: boolean | null) => {
    if (status === null) return 'Not Tested';
    return status ? 'Success' : 'Failed';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Backend Connection Test</CardTitle>
        <CardDescription>
          Test connectivity to your backend API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection:</span>
            <Badge variant={getStatusColor(testResults.connection)}>
              {getStatusText(testResults.connection)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Registration:</span>
            <Badge variant={getStatusColor(testResults.registration)}>
              {getStatusText(testResults.registration)}
            </Badge>
          </div>
        </div>

        {testResults.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{testResults.error}</p>
          </div>
        )}

        <Button 
          onClick={testBackendConnection} 
          disabled={isTesting}
          className="w-full"
        >
          {isTesting ? 'Testing...' : 'Test Backend Connection'}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Expected URL:</strong> https://localhost:7296/api</p>
          <p><strong>Alternative:</strong> http://localhost:5166/api</p>
          <p><strong>Make sure:</strong></p>
          <ul className="list-disc list-inside ml-2">
            <li>Backend is running with `dotnet run`</li>
            <li>SSL certificate is trusted (for HTTPS)</li>
            <li>CORS is configured for frontend origin</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BackendTest;






