'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '@campustuck/shared';
import { authAPI, configAPI } from '../lib/api';
import { useToast } from '../components/Toast';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshUser = async () => {
    try {
      // Ensure CSRF cookie is initialized
      await configAPI.getCsrf().catch(() => {});
      const data = await authAPI.me();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const data = await authAPI.login(credentials);
      if (data.success && data.user) {
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed.');
      throw err;
    }
  };

  const register = async (userData: { name: string; email: string; password: string; phone: string }) => {
    try {
      const data = await authAPI.register(userData);
      if (data.success && data.user) {
        setUser(data.user);
        toast.success(`Account created! Welcome to CampusTuck, ${data.user.name}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      toast.info('You have been logged out.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to logout.');
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const res = await authAPI.updateProfile(data);
      if (res.success && res.user) {
        setUser(res.user);
        toast.success('Profile updated successfully.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
