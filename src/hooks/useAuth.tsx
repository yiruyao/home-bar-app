import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

// Helper function to create or update user profile
const createOrUpdateProfile = async (user: User) => {
  try {
    // Extract name from user metadata
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
    const nameParts = fullName ? fullName.split(' ') : [];
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    // Profile data for upsert (using user_id to reference auth.users.id)
    const profileData = {
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      email: user.email || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    console.log('👤 Creating profile with ID:', user.id, 'for email:', user.email);
    
    // Use UPSERT with email constraint
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'email'
      })
      .select()
      .single();
      
    if (error) {
      console.error('❌ Profile creation failed:', error);
    } else {
      console.log('✅ Profile created/updated:', data);
    }
  } catch (error) {
    // Silent - only log in development if needed
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Flag to prevent multiple profile creations
  const profileCreationRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only create/update profile for new sign-ins (not on initial session load)
        if (event === 'SIGNED_IN' && session?.user) {
          // Prevent duplicate profile creation for the same user
          if (!profileCreationRef.current.has(session.user.id)) {
            profileCreationRef.current.add(session.user.id);
            createOrUpdateProfile(session.user).catch(() => {
              // Silent error handling
            });
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for app resume to check for OAuth completion
    const handleAppResume = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && !user) {
          setSession(session);
          setUser(session.user);
        }
      });
    };

    // Add event listeners for app resume
    window.addEventListener('focus', handleAppResume);
    window.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        handleAppResume();
      }
    });

    // Handle deep links from OAuth callbacks
    let appUrlListener: any = null;
    const setupAppListener = async () => {
      if (Capacitor.isNativePlatform()) {
        appUrlListener = await App.addListener('appUrlOpen', async ({ url }) => {
          // Process OAuth callbacks for both Google and Apple
          if (url.includes('#') || url.includes('access_token') || url.includes('code=')) {
            try {
              // Extract the fragment (everything after #)
              const fragment = url.split('#')[1];
              if (!fragment) return;
              
              // Parse URL parameters
              const params = new URLSearchParams(fragment);
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');
              
              if (!accessToken) {
                toast({
                  title: "Sign In Error",
                  description: "No access token received from OAuth provider",
                  variant: "destructive",
                });
                return;
              }
              
              // Set the session directly using the tokens
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });
              
              if (error) {
                toast({
                  title: "Sign In Error",
                  description: error.message,
                  variant: "destructive",
                });
              } else if (data?.session) {
                toast({
                  title: "Signed In",
                  description: "Successfully signed in!",
                });
              }
            } catch (error) {
              // Silent error handling
            }
          }
        });
      }
    };
    
    setupAppListener();

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', handleAppResume);
      window.removeEventListener('visibilitychange', handleAppResume);
      if (appUrlListener) {
        appUrlListener.remove();
      }
    };
  }, [toast]);

  const signInWithProvider = useCallback(async (provider: 'google' | 'apple') => {
    try {
      // Use web OAuth for both Google and Apple
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider === 'apple' ? 'apple' : 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: new Error(errorMessage) };
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    try {
      // Clear Supabase session
      const { error } = await supabase.auth.signOut();
      
      // Clear all local storage data
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear React Query cache but preserve profile for faster re-login
      queryClient.removeQueries({ queryKey: ['items'] });
      queryClient.removeQueries({ queryKey: ['conversations'] });
      
      // Reset auth state immediately
      setUser(null);
      setSession(null);

      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });

      return { error: null };
    } catch (error) {
      // Clear data even if there's an error
      localStorage.clear();
      sessionStorage.clear();
      queryClient.removeQueries({ queryKey: ['items'] });
      queryClient.removeQueries({ queryKey: ['conversations'] });
      setUser(null);
      setSession(null);
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      
      return { error: null };
    }
  }, [toast, queryClient]);

  return {
    user,
    session,
    loading,
    signInWithProvider,
    signOut,
  };
};