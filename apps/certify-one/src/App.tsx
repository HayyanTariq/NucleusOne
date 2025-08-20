
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TrainingProvider } from "@/contexts/TrainingContext";
import SplashScreen from "@/components/SplashScreen";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/components/SignupPage";
import { AppLayout } from "@/components/Layout/AppLayout";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { OwnerDashboard } from "@/pages/owner/OwnerDashboard";
import { UserManagement } from "@/pages/admin/UserManagement";
import { AllTrainings } from "@/pages/admin/AllTrainings";
import { Reports } from "@/pages/admin/Reports";
import { ManageAdmins } from "@/pages/admin/ManageAdmins";
import { EmployeeDashboard } from "@/pages/employee/EmployeeDashboard";
import { MyTraining } from "@/pages/employee/MyTraining";
import { MySessions } from "@/pages/employee/MySessions";
import { MyCourses } from "@/pages/employee/MyCourses";
import { MyCertificates } from "@/pages/employee/MyCertificates";
import { Schedule } from "@/pages/employee/Schedule";
import { Settings } from "@/pages/Settings";
import { TrainingTest } from "@/components/TrainingTest";
import { ApiDebugger } from "@/components/Debug/ApiDebugger";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean; ownerOnly?: boolean }> = ({ children, adminOnly = false, ownerOnly = false }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (ownerOnly && user?.role !== 'owner') {
    return <Navigate to="/owner/dashboard" replace />;
  }

  if (adminOnly && user?.role !== 'admin' && user?.role !== 'owner') {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

const RoleBasedRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'owner') {
    return <Navigate to="/owner/dashboard" replace />;
  }
  
  return user?.role === 'admin' 
    ? <Navigate to="/admin/dashboard" replace />
    : <Navigate to="/employee/dashboard" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<SplashScreen />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/dashboard" element={<RoleBasedRedirect />} />
    <Route 
      path="/owner/dashboard" 
      element={
        <ProtectedRoute ownerOnly={true}>
          <OwnerDashboard />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/admin/dashboard" 
      element={
        <ProtectedRoute adminOnly={true}>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/admin/users" 
      element={
        <ProtectedRoute adminOnly={true}>
          <UserManagement />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/admin/trainings" 
      element={
        <ProtectedRoute adminOnly={true}>
          <AllTrainings />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/admin/reports" 
      element={
        <ProtectedRoute adminOnly={true}>
          <Reports />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/admin/manage-admins" 
      element={
        <ProtectedRoute ownerOnly={true}>
          <ManageAdmins />
        </ProtectedRoute>
      } 
    />
    <Route
      path="/employee/dashboard" 
      element={
        <ProtectedRoute>
          <EmployeeDashboard />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/employee/training" 
      element={
        <ProtectedRoute>
          <MyTraining />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/employee/sessions" 
      element={
        <ProtectedRoute>
          <MySessions />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/employee/courses" 
      element={
        <ProtectedRoute>
          <MyCourses />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/employee/certificates" 
      element={
        <ProtectedRoute>
          <MyCertificates />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/employee/schedule" 
      element={
        <ProtectedRoute>
          <Schedule />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/settings" 
      element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/test-api" 
      element={
        <ProtectedRoute>
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">API Testing</h1>
              <p className="text-muted-foreground">
                Test your backend training API integration
              </p>
            </div>
            <TrainingTest />
          </div>
        </ProtectedRoute>
      } 
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TrainingProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </TrainingProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
