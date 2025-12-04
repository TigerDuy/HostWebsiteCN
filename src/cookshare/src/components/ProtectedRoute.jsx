import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // Nếu không có token, redirect về Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có token, hiển thị component
  return children;
}

export default ProtectedRoute;
