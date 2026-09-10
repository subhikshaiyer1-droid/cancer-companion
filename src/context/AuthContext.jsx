import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fallback to local storage if Supabase fails or is not configured
  const mockLogin = (email) => {
    const mockUser = { id: 'mock-user-id', email };
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    setUser(mockUser);
    
    // Check if profile exists in local storage
    const storedProfile = localStorage.getItem('mockProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
    
    // Simple admin check based on email for testing
    if (email === 'admin@example.com') {
      setIsAdmin(true);
    }
    return { user: mockUser };
  };

  useEffect(() => {
    // Check active sessions and sets the user
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        // If Supabase is not configured (e.g. placeholder URL), it might throw an error or return null
        if (error || !data?.session) {
          throw new Error("No session or error connecting");
        }
        
        setUser(data.session.user);
        await fetchProfile(data.session.user.id);
        
      } catch (err) {
        // Fallback to mock session
        const mockUser = localStorage.getItem('mockUser');
        if (mockUser) {
          const parsedUser = JSON.parse(mockUser);
          setUser(parsedUser);
          if (parsedUser.email === 'admin@example.com') setIsAdmin(true);
          
          const mockProfile = localStorage.getItem('mockProfile');
          if (mockProfile) {
            setProfile(JSON.parse(mockProfile));
          }
        }
        setLoading(false);
      }
    };

    checkSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchProfile(session.user.id);
          } else {
            setProfile(null);
            setIsAdmin(false);
            setLoading(false);
          }
        }
      );
      return () => subscription?.unsubscribe();
    } catch(err) {
      // Supabase not configured
      return () => {};
    }
  }, []);

  const fetchProfile = async (userId) => {
    try {
      if (userId === 'mock-user-id') {
        const mockProfile = localStorage.getItem('mockProfile');
        setProfile(mockProfile ? JSON.parse(mockProfile) : null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      setProfile(data || null); // null if profile not found (needs onboarding)
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }
      return data;
    } catch (err) {
      // If we're using placeholder keys, fallback to mock auth
      if (import.meta.env.VITE_SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE' || !import.meta.env.VITE_SUPABASE_URL) {
        return mockLogin(email);
      }
      throw err;
    }
  };

  const register = async (userData) => {
    const { email, password } = userData;
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }
      return data;
    } catch (err) {
      // If we're using placeholder keys, fallback to mock auth
      if (import.meta.env.VITE_SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE' || !import.meta.env.VITE_SUPABASE_URL) {
        return mockLogin(email);
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch(err) {
      // Ignore
    }
    localStorage.removeItem('mockUser');
    localStorage.removeItem('mockProfile');
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  const updateProfile = (updatedFields) => {
    setProfile((prev) => {
      const newProfile = { ...prev, ...updatedFields };
      if (user?.id === 'mock-user-id') {
        localStorage.setItem('mockProfile', JSON.stringify(newProfile));
      }
      return newProfile;
    });
  };

  // We consider the user authenticated if `user` object exists.
  // We can consider them "fully onboarded" if `profile` object exists.
  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        fetchProfile,
        isAuthenticated: Boolean(user),
        hasCompletedOnboarding: Boolean(profile)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};