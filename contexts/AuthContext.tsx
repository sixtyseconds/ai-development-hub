'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, fetchFromTable } from '@/utils/supabase';
import { Profile } from '@/utils/supabase-types';
import { useRouter, usePathname } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Function to refresh the session and user data
  const refreshSession = async () => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile with optimized query
        const { data } = await fetchFromTable<Profile>('profiles', {
          select: '*',
          filters: { id: session.user.id },
          limit: 1,
          forceRefresh: true, // Always get fresh data
        });
        
        setProfile(data && data.length > 0 ? data[0] : null);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setAuthError(error instanceof Error ? error : new Error('Unknown error refreshing session'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check for auth error in URL
    const handleAuthError = () => {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const errorCode = url.hash ? new URLSearchParams(url.hash.substring(1)).get('error_code') : null;
        
        if (errorCode === 'otp_expired') {
          // Redirect to verification error page with the error parameters
          const errorParams = url.hash.substring(1);
          router.push(`/auth/verification-error?${errorParams}`);
        }
      }
    };
    
    handleAuthError();
    
    // Get initial session
    refreshSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state changed: ${event}`);
      
      try {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile with optimized query
          const { data } = await fetchFromTable<Profile>('profiles', {
            select: '*',
            filters: { id: session.user.id },
            limit: 1,
            forceRefresh: true, // Always get fresh data on auth change
          });
          
          setProfile(data && data.length > 0 ? data[0] : null);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        setAuthError(error instanceof Error ? error : new Error('Unknown error handling auth state change'));
      } finally {
        setIsLoading(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);
  
  // Handle navigation errors by refreshing the session
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh session when tab becomes visible again
        refreshSession();
      }
    };
    
    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up event listener
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Redirect to dashboard after successful login
      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      setAuthError(error instanceof Error ? error : new Error('Unknown error signing in'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        console.log("User created successfully:", data.user.id);
        
        // Create a profile for the new user
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: fullName,
          role: 'client', // Default role for new users
        });
        
        if (profileError) {
          console.error("Error creating profile:", profileError);
          throw profileError;
        }
        
        console.log("Profile created successfully");
        
        // Fetch the session after signup
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Fetch the newly created profile
          const { data: profileData } = await fetchFromTable<Profile>('profiles', {
            select: '*',
            filters: { id: data.user.id },
            limit: 1,
            forceRefresh: true,
          });
          
          setProfile(profileData && profileData.length > 0 ? profileData[0] : null);
        }
        
        // Redirect to verification page
        router.push('/auth/verify');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setAuthError(error instanceof Error ? error : new Error('Unknown error signing up'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signOut = async () => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Clear user and profile state
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Clear localStorage to prevent stale data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
      }
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthError(error instanceof Error ? error : new Error('Unknown error signing out'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    user,
    profile,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 