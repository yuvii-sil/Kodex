import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (section: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<string, { password: string; user: User }> = {
  commander: {
    password: 'admin123',
    user: {
      id: '1',
      username: 'commander',
      role: 'Commander',
      name: 'Col. Sarah Johnson'
    }
  },
  hr: {
    password: 'hr123',
    user: {
      id: '2',
      username: 'hr',
      role: 'HR',
      name: 'Maj. David Chen'
    }
  },
  medical: {
    password: 'med123',
    user: {
      id: '3',
      username: 'medical',
      role: 'Medical Officer',
      name: 'Dr. Emily Rodriguez'
    }
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('iaf-user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    const userRecord = mockUsers[username.toLowerCase()];
    
    if (userRecord && userRecord.password === password) {
      setUser(userRecord.user);
      localStorage.setItem('iaf-user', JSON.stringify(userRecord.user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('iaf-user');
  };

  const hasPermission = (section: string): boolean => {
    if (!user) return false;
    
    switch (user.role) {
      case 'Commander':
        return true; // Full access
      case 'HR':
        return !['medical-details', 'health-scores'].includes(section);
      case 'Medical Officer':
        return ['medical-details', 'health-scores', 'dashboard'].includes(section);
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}