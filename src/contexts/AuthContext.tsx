import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('[AuthContext] Authentication timeout, setting loading to false');
      setLoading(false);
      setIsNewUser(false);
    }, 10000); // 10 second timeout

    const checkUserRow = async (sessionUser: any) => {
      if (!sessionUser) {
        setIsNewUser(false);
        setLoading(false);
        return;
      }
      try {
        // Add timeout to the Supabase query
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout')), 5000)
        );

        const queryPromise = supabase
          .from('users')
          .select('id')
          .eq('email', sessionUser.email)
          .single();

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

        // Only set isNewUser to true if we're certain the user doesn't exist
        // If there's an error or timeout, assume user exists to prevent unwanted redirects
        if (data && !error) {
          setIsNewUser(false); // User exists in database
        } else if (error && error.code === 'PGRST116') {
          setIsNewUser(true); // User not found (specific error code)
        } else {
          // For any other error or timeout, assume user exists to prevent unwanted redirects
          console.warn('[AuthContext] Query error/timeout, assuming user exists:', error);
          setIsNewUser(false);
        }
      } catch (err) {
        console.error('[AuthContext] Error checking user row:', err);
        // On any exception, assume user exists to prevent unwanted redirects
        setIsNewUser(false);
        // If it's a network error, we might want to retry later
        if (err instanceof Error && err.message.includes('timeout')) {
          console.warn('[AuthContext] Network timeout, will retry on next auth state change');
        }
      }
      setLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[AuthContext] onAuthStateChange:', session);
      setUser(session?.user ?? null);
      await checkUserRow(session?.user ?? null);
    });

    // On mount, get current session
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('[AuthContext] getSession on mount:', data?.session, error);
      setUser(data?.session?.user ?? null);
      checkUserRow(data?.session?.user ?? null);
      clearTimeout(timeoutId);
    }).catch((err) => {
      console.error('[AuthContext] Error restoring session:', err);
      setUser(null);
      setLoading(false);
      clearTimeout(timeoutId);
    });

    return () => {
      clearTimeout(timeoutId);
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Helper to extract Google profile info
  const getGoogleProfile = (user: any) => {
    if (!user) return null;
    const { user_metadata } = user;
    return {
      name: user_metadata?.full_name || user_metadata?.name || '',
      email: user.email || user_metadata?.email || '',
      avatar: user_metadata?.avatar_url || '',
      plan: user_metadata?.plan || 'Premium Plan'
    };
  };

  const signInWithGoogle = async (redirectAfterLogin?: string) => {
    setLoading(true);

    // Store the redirect destination if provided
    if (redirectAfterLogin) {
      setRedirectTo(redirectAfterLogin);
      // Store in sessionStorage as backup
      sessionStorage.setItem('redirectAfterLogin', redirectAfterLogin);
    }

    const oauthRedirectUrl = window.location.origin;
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: oauthRedirectUrl } });
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Clear redirect destination on sign out
    setRedirectTo(null);
    sessionStorage.removeItem('redirectAfterLogin');
  };

  const completeOnboarding = () => {
    setIsNewUser(false);
  };

  const getRedirectDestination = () => {
    const destination = redirectTo || sessionStorage.getItem('redirectAfterLogin');
    if (destination) {
      // Clear the stored destination
      setRedirectTo(null);
      sessionStorage.removeItem('redirectAfterLogin');
      return destination;
    }
    return null;
  };

  // Debug logging
  console.log('[AuthContext] Current state:', {
    user: user?.id,
    loading,
    isNewUser,
    hasUser: !!user,
    redirectTo,
    timestamp: new Date().toISOString()
  });

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithGoogle,
      signOut,
      googleProfile: getGoogleProfile(user),
      isNewUser,
      setIsNewUser,
      completeOnboarding,
      getRedirectDestination
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);