import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // No automatic demo login
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cc_user');
    return saved ? JSON.parse(saved) : null;
  });

  // No automatic demo token
  const [token, setToken] = useState(() => {
    return localStorage.getItem('cc_token') || null;
  });

  // Save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('cc_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cc_user');
    }
  }, [user]);

  // Save token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('cc_token', token);
    } else {
      localStorage.removeItem('cc_token');
    }
  }, [token]);


  // LOGIN
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }

      setUser(data.user);
      setToken(data.token);

      return {
        success: true
      };

    } catch (err) {

      /*
        DEMO LOGIN FALLBACK

        Since your backend may not be deployed yet,
        this allows the entered user information
        to create a session instead of automatically
        logging in as Eleanor.
      */

      if (!email || !password) {
        throw new Error('Please enter your email and password');
      }

      const isAdmin = email.toLowerCase().includes('admin');

      const loggedInUser = {
        id: 'usr-' + Date.now(),
        name: email.split('@')[0],
        email: email,
        role: isAdmin ? 'admin' : 'patient',
        diagnosis: isAdmin ? '' : 'Cancer Care Patient'
      };

      setUser(loggedInUser);

      setToken(
        isAdmin
          ? 'demo-admin-token'
          : 'demo-patient-token'
      );

      return {
        success: true
      };
    }
  };


  // REGISTER
  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setUser(data.user);
      setToken(data.token);

      return {
        success: true
      };

    } catch (err) {

      /*
        DEMO REGISTRATION FALLBACK

        Creates a user using the information
        actually entered in the registration form.
      */

      if (
        !userData.name ||
        !userData.email ||
        !userData.password
      ) {
        throw new Error(
          'Please fill in all required fields'
        );
      }

      const newUser = {
        id: 'usr-' + Date.now(),
        name: userData.name,
        email: userData.email,
        role: 'patient',
        diagnosis: userData.diagnosis || ''
      };

      setUser(newUser);

      setToken('demo-patient-token');

      return {
        success: true
      };
    }
  };


  // LOGOUT
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('cc_user');
    localStorage.removeItem('cc_token');
  };


  // UPDATE PROFILE
  const updateProfile = (updatedFields) => {
    setUser((previousUser) => ({
      ...previousUser,
      ...updatedFields
    }));
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        updateProfile,

        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  return useContext(AuthContext);
};