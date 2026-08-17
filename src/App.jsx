import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import PatientRegister from "./pages/patient/PatientRegister";
import DoctorRegister from "./pages/doctor/DoctorRegister";
import ClinicRegister from "./pages/admin/ClinicRegister";

import AdminDashboard from "./pages/admin/AdminDashboard";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import PatientDashboard from "./pages/patient/PatientDashboard";
import FindHealthcare from "./pages/patient/FindHealthcare";
import QueueTracker from "./pages/patient/QueueTracker";
import Prescriptions from "./pages/patient/Prescriptions";

import BookAppointmentModal from "./components/BookAppointmentModal";
import AIHealthModal from "./components/AIHealthModal";
import EmergencyModal from "./components/EmergencyModal";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRedirect from "./components/RoleRedirect";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { useAuth } from "./Context/useAuth";

function App() {
  const { userData } = useAuth();
  const role = userData?.role || "patient";
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/patient") || location.pathname.startsWith("/doctor") || location.pathname.startsWith("/admin");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Global Modals State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);

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
            onOpenBookModal={() => setIsBookModalOpen(true)}
            onOpenAIModal={() => setIsAIModalOpen(true)}
            onOpenSOS={() => setIsSOSModalOpen(true)}
          />
          <div 
            className="sidebar-overlay" 
            onClick={closeMobileSidebar} 
            aria-hidden="true" 
          />
          <main className="main-content">
            <Routes>
              {/* Patient Routes */}
              <Route
                path="/patient"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <PatientDashboard 
                      onOpenBookModal={() => setIsBookModalOpen(true)}
                      onOpenAIModal={() => setIsAIModalOpen(true)}
                      onOpenSOS={() => setIsSOSModalOpen(true)}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/healthcare"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <FindHealthcare />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/queue"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <QueueTracker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/prescription"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <Prescriptions />
                  </ProtectedRoute>
                }
              />

              {/* Doctor Routes */}
              <Route
                path="/doctor"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/schedule"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/records"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/facilities"
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
          <Route path="/register/patient" element={<PatientRegister />} />
          <Route path="/register/doctor" element={<DoctorRegister />} />
          <Route path="/register/clinic" element={<ClinicRegister />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<RoleRedirect />} />
        </Routes>
      )}

      {/* Global Modals */}
      <BookAppointmentModal 
        isOpen={isBookModalOpen} 
        onClose={() => setIsBookModalOpen(false)} 
      />
      <AIHealthModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        onOpenSOS={() => setIsSOSModalOpen(true)}
      />
      <EmergencyModal 
        isOpen={isSOSModalOpen} 
        onClose={() => setIsSOSModalOpen(false)} 
      />
    </div>
  );
}

export default App;