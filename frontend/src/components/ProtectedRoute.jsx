import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { token, user } = useSelector((state) => state.auth);

  // ✅ No token → force login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Role-based protection (optional)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
