
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@/lib/types';
import api from '@/utils/api';
import { TERMS_VERSION } from '@/pages/TermsOfService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  termsAccepted: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  acceptTerms: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const signIn = async (token: string) => {
    const response = await api.post(`/auth/login`, { token });
    console.log("Response from login server:", response.data);
    setCurrentUser(response.data["user"]);

    if (response.data["termsAccepted"] && response.data["termsAccepted"].version == TERMS_VERSION) {
      setTermsAccepted(true);
    }
    
    setLoading(false);
  };

  const signOut = async () => {
    console.log("Signing out...");
    // In a real implementation, this would sign out from Google OAuth
    const response = await api.post(`/auth/logout`);
    setCurrentUser(null);
    setLoading(false);
  };

  const acceptTerms = async  () => {
    await api.post(`/auth/accept-terms`, { version: TERMS_VERSION });
    setTermsAccepted(true);
  };

  // Auto-login for development purposes
  useEffect(() => {
    const checkAuth = async () => {
      // In production, this would check if the user is logged in with Google
      // For now, we'll simulate a logged-in state
      const response = await api.get(`/auth/status`);
      setCurrentUser(response.data["user"]);
      setTermsAccepted(response.data["termsAccepted"] && response.data["termsAccepted"].version === TERMS_VERSION);
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
