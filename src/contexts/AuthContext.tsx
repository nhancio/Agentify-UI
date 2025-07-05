import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    const checkUserRow = async (sessionUser: any) => {
      if (!sessionUser) {
        setIsNewUser(false);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('email', sessionUser.email)
          .single();
        setIsNewUser(!data || !!error);
      } catch (err) {
        setIsNewUser(true);
      }
      setLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      await checkUserRow(session?.user ?? null);
    });

    // On mount, get current session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      checkUserRow(data.session?.user ?? null);
    });

    return () => {
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

  const signInWithGoogle = async () => {
    setLoading(true);
    const redirectTo = window.location.origin;
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, googleProfile: getGoogleProfile(user), isNewUser, setIsNewUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);