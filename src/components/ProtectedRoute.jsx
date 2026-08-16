import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/useAuth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold">
            MediPulse
          </div>

          <p className="mt-2 text-gray-500">
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // User has no role
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold">
            Account Setup Required
          </h2>

          <p className="mt-2 text-gray-500">
            We couldn't determine your account role.
          </p>
        </div>
      </div>
    );
  }

  // Wrong role
  if (
    allowedRoles &&
    !allowedRoles.includes(role)
  ) {
    switch (role) {
      case "admin":
        return <Navigate to="/admin" replace />;

      case "doctor":
        return <Navigate to="/doctor" replace />;

      case "patient":
        return <Navigate to="/patient" replace />;

      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;