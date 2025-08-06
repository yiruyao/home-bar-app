import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { SignInWithApple } from '@capacitor-community/apple-sign-in';
import { clearImageCache } from '@/lib/storage';

// Helper function to create or update user profile
const createOrUpdateProfile = async (user: User) => {
  try {
    
    // Extract name from user metadata - handle both Google and Apple formats
    let firstName = '';
    let lastName = '';
    
    // Try multiple Apple Sign-In field variations
    if (user.user_metadata?.first_name) {
      firstName = user.user_metadata.first_name;
      lastName = user.user_metadata.last_name || '';
    }
    // Check for Apple's "name" object format
    else if (user.user_metadata?.name?.firstName) {
      firstName = user.user_metadata.name.firstName;
      lastName = user.user_metadata.name.lastName || '';
    }
    // Google Sign-In or fallback to full_name/name
    else if (user.user_metadata?.full_name || user.user_metadata?.name) {
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
      if (typeof fullName === 'string') {
        const nameParts = fullName.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      }
    }
    
    // Fallback if no name available - use email prefix or generic name
    if (!firstName) {
      if (user.email) {
        firstName = user.email.split('@')[0];
      } else {
        firstName = 'User';
      }
    }
    
    // Profile data for upsert - using email as the unique constraint (no user_id column)
    const profileData = {
      first_name: firstName,
      last_name: lastName,
      email: user.email || '', // This is the unique constraint
    };
    
    console.log('👤 Creating profile for:', user.email);
    
    // Use UPSERT with email constraint (this is the actual unique constraint)
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'email'
      })
      .select()
      .single();
      
    if (error) {
      console.error('❌ Profile creation failed:', error.message);
      throw error;
    }
    
    console.log('✅ Profile created/updated successfully');
  } catch (error) {
    console.error('❌ Profile creation error:', error);
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
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
            
            // Wait for profile creation to complete before setting session (with timeout)
            try {
              // Add timeout to prevent infinite hanging
              const profilePromise = createOrUpdateProfile(session.user);
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Profile creation timeout')), 10000)
              );
              
              await Promise.race([profilePromise, timeoutPromise]);
            } catch (error) {
              console.error('❌ Profile creation failed or timed out:', error);
              // Continue anyway, the trigger might have worked
            }
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session && session.user) {
        // Ensure profile exists for existing sessions too
        if (!profileCreationRef.current.has(session.user.id)) {
          profileCreationRef.current.add(session.user.id);
          
          try {
            // Add timeout to prevent infinite hanging
            const profilePromise = createOrUpdateProfile(session.user);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Profile verification timeout')), 10000)
            );
            
            await Promise.race([profilePromise, timeoutPromise]);
          } catch (error) {
            console.error('❌ Profile verification failed or timed out:', error);
            // Continue anyway
          }
        }
      }
      
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
          if (url.includes('#') || url.includes('access_token') || url.includes('code=') || url.includes('session')) {
            try {
              // Try Supabase's built-in session parsing first
              try {
                const { data, error } = await supabase.auth.getSessionFromUrl(url);
                
                if (data.session && data.user) {
                  setSession(data.session);
                  setUser(data.user);
                  return;
                }
                
                if (error) {
                  console.log('⚠️ getSessionFromUrl error:', error.message);
                }
              } catch (sessionError) {
                console.log('⚠️ getSessionFromUrl failed, trying manual parsing');
              }
              
              // Fallback to manual parsing
              const fragment = url.split('#')[1];
              if (!fragment) {
                console.log('❌ No fragment found in URL');
                return;
              }
              
              // Parse URL parameters
              const params = new URLSearchParams(fragment);
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');
              
              if (!accessToken) {
                console.error('❌ No access token received from OAuth provider');
                return;
              }
              
              // Set the session directly using the tokens
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });
              
              if (sessionError) {
                console.error('❌ Sign in error:', sessionError.message);
              }
            } catch (error) {
              console.error('❌ Deep link processing error:', error);
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
  }, []);

  const signInWithProvider = useCallback(async (provider: 'google' | 'apple') => {
    try {
      if (provider === 'apple' && Capacitor.isNativePlatform()) {
        // Use native Apple Sign-In for iOS
        
        try {
          const result = await SignInWithApple.authorize({
            clientId: 'com.homebarapp.app',
            redirectURI: 'com.homebarapp.app://auth/callback',
            scopes: 'email name',
          });
          
          const { identityToken, authorizationCode, email, givenName, familyName } = result.response;
          
          if (!identityToken) {
            throw new Error('No identity token received from Apple');
          }
          
          // Parse the identity token to get user information
          const payload = JSON.parse(atob(identityToken.split('.')[1]));
          
          const userEmail = email || payload.email;
          
          // Apple Sign-In name handling:
          // - First sign-in: may provide givenName/familyName
          // - Subsequent sign-ins: usually null for privacy
          // - Fallback to email prefix or extract from Apple ID
          let firstName = givenName || '';
          let lastName = familyName || '';
          
          if (!firstName) {
            if (userEmail) {
              // Extract name from email (e.g., "john.doe@icloud.com" -> "john")
              const emailPrefix = userEmail.split('@')[0];
              if (emailPrefix.includes('.')) {
                const parts = emailPrefix.split('.');
                firstName = parts[0];
                lastName = parts.slice(1).join(' ');
              } else {
                firstName = emailPrefix;
              }
            } else {
              firstName = 'Apple User';
            }
          }
          
          
          // Let's try to replicate what Google sends exactly
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: identityToken,
            options: {
              data: {
                // Send the same metadata structure as Google would
                first_name: firstName,
                last_name: lastName,
                full_name: `${firstName} ${lastName}`.trim(),
                email: userEmail,
                provider: 'apple',
                // Add more fields that Google might send
                name: `${firstName} ${lastName}`.trim(),
                picture: undefined, // Google sends profile pictures, Apple doesn't
              }
            }
          });
          
          if (data.session && data.user) {
            return { error: null };
          }
          
          if (error) {
            console.error('❌ Apple Sign-In failed:', error.message);
            
            return { error };
          }
          
          if (data.user && !data.session) {
            return { error: new Error('Sign-in successful but session not created. Please check your email confirmation settings.') };
          }
          
          return { error: new Error('Apple Sign-In failed - no session data returned') };
          
        } catch (appleError) {
          console.error('❌ Native Apple Sign-In failed:', appleError);
          return { error: appleError instanceof Error ? appleError : new Error('Apple Sign-In failed') };
        }
      } else {
        // Use web OAuth for Google or non-native platforms
        const { error } = await supabase.auth.signInWithOAuth({
          provider: provider === 'apple' ? 'apple' : 'google',
          options: {
            redirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          console.error(`❌ ${provider} authentication error:`, error.message);
          return { error };
        }

        return { error: null };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error(`❌ ${provider} authentication error:`, errorMessage);
      return { error: new Error(errorMessage) };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Clear Supabase session
      const { error } = await supabase.auth.signOut();
      
      // Clear image cache first (before localStorage.clear())
      clearImageCache();
      
      // Clear all browser storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear React Query cache completely on sign out
      queryClient.clear();
      
      // Reset auth state immediately
      setUser(null);
      setSession(null);
      
      return { error: null };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      
      // Clear data even if there's an error
      clearImageCache();
      localStorage.clear();
      sessionStorage.clear();
      queryClient.clear();
      setUser(null);
      setSession(null);
      
      return { error: null };
    }
  }, [queryClient]);

  return {
    user,
    session,
    loading,
    signInWithProvider,
    signOut,
  };
};