import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no Supabase connection is established, just stop loading.
    if (!supabase) {
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setUser(data.session?.user || null);
        if (data.session?.user) {
          await fetchProfile(data.session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Session check failed:', err);
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    if (!supabase || !userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      setProfile(data || null);
      return data || null;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const register = async (emailOrObj, passwordArg, fullNameArg) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    let email = emailOrObj;
    let password = passwordArg;
    let fullName = fullNameArg;

    if (typeof emailOrObj === 'object' && emailOrObj !== null) {
      email = emailOrObj.email;
      password = emailOrObj.password;
      fullName = emailOrObj.fullName || emailOrObj.full_name;
    }

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } catch(err) {
      console.error('Error signing out', err);
    }
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const refreshProfile = async (overrideUserId) => {
    const targetUserId = overrideUserId || user?.id;
    if (targetUserId) {
      return await fetchProfile(targetUserId);
    }
    return null;
  };

  const setProfileState = (newProfile) => {
    setProfile(newProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        setProfileState,
        isAuthenticated: Boolean(user),
        hasCompletedOnboarding: Boolean(profile?.onboarding_completed)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};