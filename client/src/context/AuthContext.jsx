import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setUserStats(res.data.stats || null);
      } else {
        setUser(null);
        setUserStats(null);
        localStorage.removeItem('careertrack_token');
      }
    } catch (err) {
      setUser(null);
      setUserStats(null);
      localStorage.removeItem('careertrack_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      if (res.data.token) {
        localStorage.setItem('careertrack_token', res.data.token);
      }
      setUser(res.data.user);
      await checkAuth();
    }
    return res.data;
  };

  // Register
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      if (res.data.token) {
        localStorage.setItem('careertrack_token', res.data.token);
      }
      setUser(res.data.user);
      await checkAuth();
    }
    return res.data;
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setUserStats(null);
      localStorage.removeItem('careertrack_token');
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.data.success) {
      setUser(res.data.user);
    }
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userStats,
        loading,
        login,
        register,
        logout,
        checkAuth,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
