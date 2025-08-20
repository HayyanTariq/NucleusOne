import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { trainingService } from '@/services/trainingService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { RoleBasedTrainingAccess } from '@/components/Training/RoleBasedTrainingAccess';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Test component to verify training API integration
 * This can be used for testing the backend connection
 */
export const TrainingTest: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  const testCertificationSubmission = async () => {
    setIsLoading('certification');
    try {
      const testData = {
        type: 'certification' as const,
        certificationName: 'AWS Certified Developer',
        issuingOrganization: 'Amazon Web Services',
        issueDate: '2024-01-15', // yyyy-MM-dd format
        expirationDate: '2027-01-15', // Optional field in yyyy-MM-dd format
        credentialId: 'AWS-DEV-2024-001',
        credentialUrl: 'https://aws.amazon.com/verification/credentials',
        description: 'Cloud development certification from AWS',
        level: 'intermediate' as const,
        skillsLearned: ['AWS Lambda', 'DynamoDB', 'API Gateway', 'CloudFormation'],
      };

      console.log('🧪 Testing certification submission:', testData);
      const response = await trainingService.submitTraining(testData);
      
      toast({
        title: "Test Successful",
        description: "Certification submitted successfully to backend!",
      });
      
      console.log('✅ Test response:', response);
      setTestResults(prev => [...prev, { type: 'certification', success: true, response }]);
    } catch (error) {
      console.error('❌ Test failed:', error);
      toast({
        title: "Test Failed",
        description: `Backend connection failed: ${error.message}`,
        variant: "destructive",
      });
      setTestResults(prev => [...prev, { type: 'certification', success: false, error: error.message }]);
    } finally {
      setIsLoading(null);
    }
  };

  const testCourseSubmission = async () => {
    try {
      const testData = {
        type: 'course' as const,
        courseTitle: 'Complete JavaScript Course',
        platform: 'Udemy',
        startDate: '2024-01-10', // yyyy-MM-dd format
        completionDate: '2024-02-20', // Optional field in yyyy-MM-dd format
        courseDuration: '40 hours',
        certificateLink: 'https://certificate.udemy.com/abc123',
        courseDescription: 'Comprehensive JavaScript course covering ES6+',
        skillsLearned: ['JavaScript', 'ES6', 'Async/Await', 'DOM Manipulation'],
      };

      console.log('🧪 Testing course submission:', testData);
      const response = await trainingService.submitTraining(testData);
      
      toast({
        title: "Test Successful",
        description: "Course submitted successfully to backend!",
      });
      
      console.log('✅ Test response:', response);
    } catch (error) {
      console.error('❌ Test failed:', error);
      toast({
        title: "Test Failed",
        description: `Backend connection failed: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const testSessionSubmission = async () => {
    try {
      const testData = {
        type: 'session' as const,
        sessionTopic: 'React Development Fundamentals',
        instructorName: 'John Smith',
        sessionDate: '2024-02-15', // yyyy-MM-dd format
        startTime: '09:00', // hh:mm format (24-hour)
        endTime: '17:00', // hh:mm format (24-hour)
        duration: '8h 0m',
        location: 'online' as const,
        agenda: 'Introduction to React, Components, State Management',
        learnedOutcome: 'Understanding of React basics and component architecture',
      };

      console.log('🧪 Testing session submission:', testData);
      const response = await trainingService.submitTraining(testData);
      
      toast({
        title: "Test Successful",
        description: "Training session submitted successfully to backend!",
      });
      
      console.log('✅ Test response:', response);
    } catch (error) {
      console.error('❌ Test failed:', error);
      toast({
        title: "Test Failed",
        description: `Backend connection failed: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Training API Test</h2>
      <p className="text-sm text-muted-foreground">
        Use these buttons to test the backend API connection. Check the browser console for detailed logs.
      </p>
      
      <div className="flex space-x-4">
        <Button onClick={testCertificationSubmission} variant="outline">
          🎓 Test Certification API
        </Button>
        
        <Button onClick={testCourseSubmission} variant="outline">
          📚 Test Course API
        </Button>
        
        <Button onClick={testSessionSubmission} variant="outline">
          👨‍🏫 Test Session API
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p><strong>Backend URL:</strong> https://localhost:7132/api</p>
        <p><strong>Endpoints:</strong></p>
        <ul className="ml-4 list-disc">
          <li>POST /trainings/certifications</li>
          <li>POST /trainings/courses</li>
          <li>POST /trainings/sessions</li>
        </ul>
      </div>
    </div>
  );
};
