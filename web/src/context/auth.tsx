import React, { createContext, useContext, useState, useEffect } from "react";
import { useFetchCurrentUserQuery } from "../store";

interface AuthContextType {
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { error: userFetchError } = useFetchCurrentUserQuery(null);
  console.log("isAuthenticated: ",isAuthenticated);
  useEffect(() => {
    if (!userFetchError) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [userFetchError]);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
