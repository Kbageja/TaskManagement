"use client";

import { createContext, FC, ReactNode, useMemo, useState, useEffect } from "react";
import { getUser } from "@/services/user/api"; // Direct API call

type AuthContextType = {
  data: any; // Replace `any` with your user data type
  isLoading: boolean;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<any | null>(null);
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
          //("User data response:", response);
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