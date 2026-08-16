import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/useAuth";

const RoleRedirect = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading MediPulse...</p>
      </div>
    );
  }

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect according to role
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
};

export default RoleRedirect;