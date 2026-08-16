import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";

import AdminDashboard from "./pages/admin/AdminDashboard";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import PatientDashboard from "./pages/patient/PatientDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRedirect from "./components/RoleRedirect";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { useAuth } from "./Context/useAuth";

function App() {
  const { userData } = useAuth();
  const role = userData?.role || "patient";
  const location = useLocation();
  const isDashboardRoute = ["/patient", "/doctor", "/admin"].includes(location.pathname);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    const currentMobile = document.body.dataset.sidebar === "open" ? "" : "open";
    document.body.dataset.sidebar = currentMobile;
  };

  const closeMobileSidebar = () => {
    if (document.body.dataset.sidebar) {
      document.body.dataset.sidebar = "";
    }
  };

  return (
    <div className="app-layout">
      <Navbar 
        isDashboardRoute={isDashboardRoute} 
        toggleSidebar={toggleSidebar} 
      />
      {isDashboardRoute ? (
        <div className="app-container">
          <Sidebar 
            role={role} 
            isCollapsed={isSidebarCollapsed} 
            onCloseMobile={closeMobileSidebar} 
          />
          <div 
            className="sidebar-overlay" 
            onClick={closeMobileSidebar} 
            aria-hidden="true" 
          />
          <main className="main-content">
            <Routes>
              {/* Patient */}
              <Route
                path="/patient"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Doctor */}
              <Route
                path="/doctor"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<RoleRedirect />} />
        </Routes>
      )}
    </div>
  );
}

export default App;