import React from "react";
import { useAuth } from "../context/auth";
import LoginReminder from "./LoginReminder";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginReminder />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
