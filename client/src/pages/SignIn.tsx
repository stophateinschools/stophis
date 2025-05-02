import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

export default function SignIn() {
  const { currentUser, loading, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (token: string) => {
    try {
      await signIn(token);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      console.log("CHANGE User is already signed in:", currentUser);
      // return <Navigate to="/dashboard" replace />;
    }
  }, [currentUser]);

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
          <GoogleLogin
              onSuccess={credentialResponse => {
                console.log("CHANGE RESPONSE ", credentialResponse);
                handleSignIn(credentialResponse.credential);
              }}
              onError={() => {
                console.log('Login Failed');
              }}
            />
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
