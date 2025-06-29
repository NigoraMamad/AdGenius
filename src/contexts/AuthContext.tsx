'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authMethod: 'telegram' | 'google' | null;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMethod, setAuthMethod] = useState<'telegram' | 'google' | null>(null);

  const isAuthenticated = !!user;

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for Telegram Mini App
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        console.log("🔍 Telegram WebApp detected:", tg);
        console.log("🔍 Init data unsafe:", tg.initDataUnsafe);
        
        // Try multiple sources for user data
        let telegramUser = null;
        
        if (tg.initDataUnsafe?.user) {
          telegramUser = tg.initDataUnsafe.user;
          console.log("✅ Got user from initDataUnsafe:", telegramUser);
        } else if (tg.initData) {
          // Try to parse from initData string
          try {
            const initParams = new URLSearchParams(tg.initData);
            const userParam = initParams.get('user');
            if (userParam) {
              telegramUser = JSON.parse(userParam);
              console.log("✅ Got user from initData:", telegramUser);
            }
          } catch (parseError) {
            console.log("⚠️ Failed to parse initData:", parseError);
          }
        }
        
        if (telegramUser) {
          setAuthMethod('telegram');
          
          // Create a user object from Telegram data
          const user: Partial<User> = {
            telegram_id: telegramUser.id?.toString(),
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            username: telegramUser.username,
            language_code: telegramUser.language_code,
            is_premium: telegramUser.is_premium,
            auth_provider: 'telegram',
          };
          
          console.log("✅ Setting Telegram user:", user);
          setUser(user as User);
          setIsLoading(false);
          return;
        } else {
          console.log("⚠️ No Telegram user data found, but WebApp is available");
          // Still in Telegram, but no user data - create a basic user
          const basicUser: Partial<User> = {
            telegram_id: 'telegram_user',
            first_name: 'Telegram User',
            auth_provider: 'telegram',
          };
          setAuthMethod('telegram');
          setUser(basicUser as User);
          setIsLoading(false);
          return;
        }
      }

      // Check for stored Google auth
      const storedUser = localStorage.getItem('adGenius_user');
      const storedAuthMethod = localStorage.getItem('adGenius_auth_method');
      
      if (storedUser && storedAuthMethod) {
        setUser(JSON.parse(storedUser));
        setAuthMethod(storedAuthMethod as 'telegram' | 'google');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    // Clear local storage
    localStorage.removeItem('adGenius_user');
    localStorage.removeItem('adGenius_auth_method');
    
    // Clear auth state
    setUser(null);
    setAuthMethod(null);

    // For Google users, sign out from Google
    if (authMethod === 'google' && window.gapi?.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      authInstance.signOut();
    }

    // Redirect to home or signin
    window.location.href = '/';
  };

  const refreshUser = async () => {
    // Implement user data refresh if needed
    try {
      if (authMethod === 'telegram' && user?.telegram_id) {
        // Refresh Telegram user data
        console.log('Refreshing Telegram user data...');
      } else if (authMethod === 'google' && user?.google_id) {
        // Refresh Google user data
        console.log('Refreshing Google user data...');
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    authMethod,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 