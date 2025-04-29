
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { GoogleOAuthProvider } from '@react-oauth/google';

// Layouts
import MainLayout from "./components/Layout/MainLayout";

// Pages
import SignIn from "./pages/SignIn";
import TermsOfService from "./pages/TermsOfService";
import Dashboard from "./pages/Dashboard";
import AllIncidents from "./pages/AllIncidents";
import IncidentDetails from "./pages/IncidentDetails";
import AddEditIncident from "./pages/AddEditIncident";
import UserManagement from "./pages/UserManagement";
import AuditLog from "./pages/AuditLog";
import Guidelines from "./pages/Guidelines";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading, termsAccepted } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (!termsAccepted && location.pathname !== '/terms') {
    return <Navigate to="/terms" replace />;
  }

  return <>{children}</>;
};

console.log("ID ", import.meta.env.VITE_GOOGLE_CLIENT_ID);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <DataProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/terms" element={
                  <ProtectedRoute>
                    <TermsOfService />
                  </ProtectedRoute>
                } />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="incidents" element={<AllIncidents />} />
                  <Route path="incidents/:id" element={<IncidentDetails />} />
                  <Route path="incidents/add" element={<AddEditIncident />} />
                  <Route path="incidents/edit/:id" element={<AddEditIncident />} />
                  <Route path="admin/users" element={<UserManagement />} />
                  <Route path="admin/audit-log" element={<AuditLog />} />
                  <Route path="guidelines" element={<Guidelines />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DataProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
