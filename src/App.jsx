import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";

import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* PUBLIC */}
        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/about"
          element={<About />}
        />


        {/* PATIENT */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRole="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />


        {/* DOCTOR */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />


        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;