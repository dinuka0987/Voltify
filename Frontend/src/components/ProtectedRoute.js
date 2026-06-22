import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ component, role, requiredRole }) => {
  if (!role) {
    return <Navigate to="/login" />;
  }

  if (role !== requiredRole) {
    return <Navigate to={role === "admin" ? "/admin/dashboard" : "/user/home"} />;
  }

  return component;
};

export default ProtectedRoute;
