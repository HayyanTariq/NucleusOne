import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trainingApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export const IntegrationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const runTests = async () => {
    setIsLoading(true);
    const results: any = {};

    try {
      // Test 1: Check if backend is accessible
      console.log('🧪 Testing backend connectivity...');
      results.connectivity = 'Testing...';

      // Test 2: Get all certifications
      try {
        console.log('🧪 Testing GET /trainings/certifications...');
        const certifications = await trainingApi.getAllCertifications();
        results.certifications = {
          status: '✅ Success',
          count: Array.isArray(certifications) ? certifications.length : 'Invalid response format',
          data: Array.isArray(certifications) ? certifications.slice(0, 2) : certifications
        };
      } catch (error: any) {
        results.certifications = {
          status: '❌ Failed',
          error: error.message
        };
      }

      // Test 3: Get all courses
      try {
        console.log('🧪 Testing GET /trainings/courses...');
        const courses = await trainingApi.getAllCourses();
        results.courses = {
          status: '✅ Success',
          count: Array.isArray(courses) ? courses.length : 'Invalid response format',
          data: Array.isArray(courses) ? courses.slice(0, 2) : courses
        };
      } catch (error: any) {
        results.courses = {
          status: '❌ Failed',
          error: error.message
        };
      }

      // Test 4: Get all sessions
      try {
        console.log('🧪 Testing GET /trainings/sessions...');
        const sessions = await trainingApi.getAllSessions();
        results.sessions = {
          status: '✅ Success',
          count: Array.isArray(sessions) ? sessions.length : 'Invalid response format',
          data: Array.isArray(sessions) ? sessions.slice(0, 2) : sessions
        };
      } catch (error: any) {
        results.sessions = {
          status: '❌ Failed',
          error: error.message
        };
      }

      // Test 5: Test legacy endpoint
      try {
        console.log('🧪 Testing GET /trainings (legacy)...');
        const allTrainings = await trainingApi.getAllTrainings();
        results.legacy = {
          status: '✅ Success',
          count: Array.isArray(allTrainings) ? allTrainings.length : 'Invalid response format',
          data: Array.isArray(allTrainings) ? allTrainings.slice(0, 2) : allTrainings
        };
      } catch (error: any) {
        results.legacy = {
          status: '❌ Failed',
          error: error.message
        };
      }

    } catch (error: any) {
      results.general = {
        status: '❌ General Error',
        error: error.message
      };
    }

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Certify One Backend Integration Test
            <Badge variant={isAuthenticated ? "default" : "destructive"}>
              {isAuthenticated ? "Authenticated" : "Not Authenticated"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This test will verify the connection to your Certify One backend API running on HTTPS port 7086.
            </p>
            {user && (
              <div className="text-sm">
                <p><strong>User:</strong> {user.firstName} {user.lastName} ({user.email})</p>
                <p><strong>Role:</strong> {user.role}</p>
                {user.isNucleusUser && (
                  <p><strong>App Role:</strong> {user.appRole}</p>
                )}
              </div>
            )}
          </div>
          
          <Button 
            onClick={runTests} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Running Tests..." : "Run Integration Tests"}
          </Button>

          {Object.keys(testResults).length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Test Results:</h3>
              
              {Object.entries(testResults).map(([testName, result]: [string, any]) => (
                <Card key={testName} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium capitalize">{testName}</h4>
                      <Badge variant={result.status?.includes('✅') ? "default" : "destructive"}>
                        {result.status}
                      </Badge>
                    </div>
                    
                    {result.error && (
                      <p className="text-sm text-red-600 mt-2">
                        <strong>Error:</strong> {result.error}
                      </p>
                    )}
                    
                    {result.count && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Count:</strong> {result.count}
                      </p>
                    )}
                    
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer text-blue-600">
                          View Sample Data
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};





