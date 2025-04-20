"use client";

import { createContext, FC, ReactNode, useMemo, useState, useEffect } from "react";
import { getUser } from "../..//services/user/api"; // Direct API call

// Define a proper User type based on the actual data structure
interface IdentityData {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
}

interface Identity {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data: IdentityData;
  provider: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string;
}

interface AppMetadata {
  provider: string;
  providers: string[];
}

interface UserMetadata {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
}

interface User {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: string;
  phone: string;
  confirmation_sent_at: string;
  confirmed_at: string;
  last_sign_in_at: string;
  app_metadata: AppMetadata;
  user_metadata: UserMetadata;
  identities: Identity[];
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}

// This matches the exact structure returned by your API
interface AuthResponse {
  message: string;
  user: User;
}

type AuthContextType = {
  data: AuthResponse | null;
  isLoading: boolean;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      // First check if user has auth tokens in storage
      const hasAuthInLocalStorage = localStorage.getItem("authData") !== null || localStorage.getItem("userId") !== null;
      const hasAuthInSessionStorage = sessionStorage.getItem("authData") !== null;
      
      // Only try to get user if we have auth data stored
      if (hasAuthInLocalStorage || hasAuthInSessionStorage) {
        try {
          setIsLoading(true);
          const response = await getUser();
          
          // Store the response data directly since it already has the correct structure
          setUserData(response?.data || null);
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Clear any potentially invalid auth data
          setUserData(null);
          localStorage.removeItem("authData");
          localStorage.removeItem("userId");
          sessionStorage.removeItem("authData");
        } finally {
          setIsLoading(false);
        }
      } else {
        // No auth data found, user is not logged in
        setUserData(null);
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const logout = () => {
    setUserData(null);
    localStorage.removeItem("authData");
    localStorage.removeItem("userId");
    sessionStorage.removeItem("authData");
  };

  const contextValue = useMemo(
    () => ({
      data: userData,
      isLoading,
      logout,
    }),
    [userData, isLoading]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};