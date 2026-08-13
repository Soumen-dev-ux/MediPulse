import { Navigate } from "react-router-dom";
import useAuth from "../Context/useAuth";

export default function ProtectedRoute({
  children,
  allowedRole,
}) {
  const {
    user,
    userData,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div>
          <div className="loading-logo">
            MediPulse
          </div>

          <p>Loading your healthcare dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    allowedRole &&
    userData?.role !== allowedRole
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}