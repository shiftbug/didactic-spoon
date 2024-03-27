import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "./AuthContext";

const ProtectedRoute = () => {
  const { token } = useContext(AuthContext); // Assuming 'token' indicates logged-in status

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
