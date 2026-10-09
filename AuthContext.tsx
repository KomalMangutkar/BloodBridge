import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DonorProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bloodbridge_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [profile, setProfile] = useState<any | null>(() => {
    const saved = localStorage.getItem('bloodbridge_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('bloodbridge_token');
  });

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    setUser(data.user);
    setProfile(data.profile);
    setToken(data.token);
    localStorage.setItem('bloodbridge_user', JSON.stringify(data.user));
    localStorage.setItem('bloodbridge_profile', JSON.stringify(data.profile));
    localStorage.setItem('bloodbridge_token', data.token);
  };

  const register = async (body: any) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('bloodbridge_user', JSON.stringify(data.user));
    localStorage.setItem('bloodbridge_token', data.token);
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setToken(null);
    localStorage.removeItem('bloodbridge_user');
    localStorage.removeItem('bloodbridge_profile');
    localStorage.removeItem('bloodbridge_token');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfile(data.profile);
        localStorage.setItem('bloodbridge_user', JSON.stringify(data.user));
        localStorage.setItem('bloodbridge_profile', JSON.stringify(data.profile));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, token, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
