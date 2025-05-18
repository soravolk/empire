import React from "react";
import { useAuth } from "../context/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div> You need to be logged in to access this content.</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
