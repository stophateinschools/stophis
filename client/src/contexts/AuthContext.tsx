
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, TermsOfService } from '@/lib/types';

// Mock data for initial development
const MOCK_USER: User = {
  id: "user1",
  name: "Demo User",
  email: "demo@example.com",
  profilePicture: "https://i.pravatar.cc/150?u=demo@example.com",
  organization: "Stop Hate in Schools",
  regions: ["California", "New York"],
  isAdmin: true,
  isArchived: false,
  incidentCount: 5,
};

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  termsAccepted: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  acceptTerms: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Mock sign in function
  const signIn = async () => {
    console.log("Signing in with Google...");
    // In a real implementation, this would integrate with Google OAuth
    setCurrentUser(MOCK_USER);
    
    // Check if user has accepted terms
    const terms: TermsOfService = {
      accepted: false,
      version: "1.0",
      acceptedDate: "",
    };
    
    setTermsAccepted(terms.accepted);
    setLoading(false);
  };

  const signOut = async () => {
    console.log("Signing out...");
    // In a real implementation, this would sign out from Google OAuth
    setCurrentUser(null);
    setLoading(false);
  };

  const acceptTerms = () => {
    console.log("Terms accepted");
    setTermsAccepted(true);
    
    // In a real implementation, this would save the acceptance to the backend
  };

  // Auto-login for development purposes
  useEffect(() => {
    const checkAuth = async () => {
      // In production, this would check if the user is logged in with Google
      // For now, we'll simulate a logged-in state
      setCurrentUser(null); // Set to MOCK_USER to auto-login
      setLoading(false);
    };

    checkAuth();
  }, []);

  const value = {
    currentUser,
    loading,
    termsAccepted,
    signIn,
    signOut,
    acceptTerms,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
