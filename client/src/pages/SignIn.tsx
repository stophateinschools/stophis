import React from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function SignIn() {
  const { currentUser, loading, signIn } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-white to-blue-50">
      <Card className="w-full max-w-md shadow-lg border-shisp-blue border-t-4">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/40945ba0-a692-41ef-ba57-e8bec64eaf29.png" 
              alt="Stop Hate in Schools Logo" 
              className="h-24" 
            />
          </div>
          <CardTitle className="text-2xl text-center text-shisp-blue">Welcome to Stop Hate in Schools Incident Tracking & Reporting Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="text-center">
            <Button
              variant="default"
              onClick={handleSignIn}
              className="w-full gap-2 bg-shisp-blue hover:bg-shisp-blue/90"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
              Sign in with Google
            </Button>
          </div>
          <div className="text-center text-sm text-shisp-gray">
            Access is restricted to authorized users. 
            <a href="https://www.stophateinschools.org/contact-us" target="_blank" rel="noopener noreferrer" className="text-shisp-blue hover:underline ml-1">
              Learn more and request access.
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
