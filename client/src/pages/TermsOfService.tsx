
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export const TERMS_VERSION = '1.0';

export default function TermsOfService() {
  const { acceptTerms } = useAuth();
  const navigate = useNavigate();

  const handleAccept = () => {
    acceptTerms();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[50vh] overflow-y-auto">
          <div className="prose prose-sm">
            <h3>Stop Hate in Schools - Terms of Service</h3>
            
            <p>By accessing the Stop Hate in Schools dashboard, you agree to these terms and conditions.</p>
            
            <h4>1. Confidentiality</h4>
            <p>All incident data shared through this platform is considered confidential. Users must respect the privacy settings established for each incident and not share information beyond authorized parties.</p>
            
            <h4>2. Data Integrity</h4>
            <p>Users are expected to provide accurate information when documenting incidents. Falsifying information may result in account termination.</p>
            
            <h4>3. Responsible Use</h4>
            <p>This platform is intended for documenting and responding to incidents of bias, harassment, hate speech, and discrimination in educational settings. It should not be used for personal disputes or matters unrelated to these purposes.</p>
            
            <h4>4. Account Security</h4>
            <p>Users are responsible for maintaining the security of their accounts and should not share access credentials with others.</p>
            
            <h4>5. Respect for Privacy</h4>
            <p>When documenting incidents involving minors or vulnerable individuals, users must take extra care to protect their identities and comply with all applicable privacy laws.</p>
            
            <h4>6. Modifications to Terms</h4>
            <p>Stop Hate in Schools reserves the right to modify these terms at any time. Users will be notified of significant changes and may be required to accept updated terms.</p>
            
            <h4>7. Termination</h4>
            <p>Stop Hate in Schools reserves the right to terminate access for users who violate these terms or misuse the platform.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/signin')}>
            Decline
          </Button>
          <Button onClick={handleAccept}>
            Accept Terms
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
