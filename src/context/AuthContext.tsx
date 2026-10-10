import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { StorageService, SEED_USERS, subscribeToStore } from '../lib/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<boolean>;
  register: (name: string, email: string, role: UserRole) => Promise<User>;
  logout: () => void;
  switchUser: (userId: string) => void;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(() => StorageService.getUsers());

  useEffect(() => {
    // Ensure dark class is removed from document root
    document.documentElement.classList.remove('dark');
    try {
      localStorage.removeItem('classflow_theme');
    } catch {
      // ignore
    }

    const unsubscribe = subscribeToStore(() => {
      setUser(StorageService.getCurrentUser());
      setAllUsers(StorageService.getUsers());
    });
    return unsubscribe;
  }, []);

  const login = async (email: string): Promise<boolean> => {
    const users = StorageService.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (found.status === 'suspended') {
        throw new Error('Your account has been suspended by an administrator.');
      }
      StorageService.setCurrentUser(found);
      setUser(found);
      return true;
    }
    throw new Error('User not found. Please register a new account or use demo accounts.');
  };

  const register = async (name: string, email: string, role: UserRole): Promise<User> => {
    const newUser = StorageService.registerUser(name, email, role);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    StorageService.setCurrentUser(null);
    setUser(null);
  };

  const switchUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      StorageService.setCurrentUser(target);
      setUser(target);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        switchUser,
        allUsers,
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
