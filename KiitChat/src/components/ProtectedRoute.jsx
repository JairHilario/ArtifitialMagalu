import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const storedProfile = localStorage.getItem("userProfile");
  const hasProfile = !!storedProfile;

  if (!hasProfile) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
