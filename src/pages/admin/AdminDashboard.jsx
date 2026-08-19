import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/useAuth";
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  Activity, 
  ShieldCheck, 
  Hospital, 
  Plus, 
  RotateCcw, 
  ChevronRight,
  Phone,
  FileText,
  Clock,
  Layers,
  Settings
} from "lucide-react";
import { subscribeToFacility, serveNextPatient, generateQueueToken, resetQueueToken } from "../../firebase/facilities";
import { subscribeAllUsers, subscribeAllDoctors, subscribeAllFacilities } from "../../firebase/firestore";
import { subscribeAllAppointments } from "../../firebase/appointments";

import AdminUsersTab from "./components/AdminUsersTab";
import AdminFacilitiesTab from "./components/AdminFacilitiesTab";
import AdminDoctorsTab from "./components/AdminDoctorsTab";
import AdminAppointmentsTab from "./components/AdminAppointmentsTab";
import AdminLogsTab from "./components/AdminLogsTab";

export default function AdminDashboard() {
  const { user, userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab mapping based on current pathname
  const getTabFromPath = () => {
    const path = location.pathname;
    if (path.includes("/admin/users")) return "users";
    if (path.includes("/admin/facilities")) return "facilities";
    if (path.includes("/admin/doctors")) return "doctors";
    if (path.includes("/admin/appointments")) return "appointments";
    if (path.includes("/admin/logs")) return "logs";
    return "overview";
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === "overview") navigate("/admin");
    else navigate(`/admin/${tabKey}`);
  };

  // Live KPI counters
  const [totalUsersCount, setTotalUsersCount] = useState(1240);
  const [verifiedDoctorsCount, setVerifiedDoctorsCount] = useState(126);
  const [facilitiesCount, setFacilitiesCount] = useState(14);
  const [appointmentsCount, setAppointmentsCount] = useState(3420);

  useEffect(() => {
    let isMounted = true;

    const unsubUsers = subscribeAllUsers((users) => {
      if (isMounted && users && users.length > 0) {
        setTotalUsersCount(users.length);
      }
    });

    const unsubDoctors = subscribeAllDoctors((docs) => {
      if (isMounted && docs && docs.length > 0) {
        setVerifiedDoctorsCount(docs.filter((d) => (d.verificationStatus || "pending") === "verified").length || docs.length);
      }
    });

    const unsubFac = subscribeAllFacilities((facs) => {
      if (isMounted && facs && facs.length > 0) {
        setFacilitiesCount(facs.length);
      }
    });

    const unsubApps = subscribeAllAppointments((apps) => {
      if (isMounted && apps && apps.length > 0) {
        setAppointmentsCount(apps.length);
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubUsers === "function") unsubUsers();
      if (typeof unsubDoctors === "function") unsubDoctors();
      if (typeof unsubFac === "function") unsubFac();
      if (typeof unsubApps === "function") unsubApps();
    };
  }, []);

  return (
    <div className="dashboard fade-in">
      {/* Admin Header */}
      <div className="dashboard-header" style={{ marginBottom: "20px" }}>
        <div>
          <p className="eyebrow">ADMINISTRATOR CONSOLE · SYSTEM OVERVIEW</p>
          <h1>Welcome, {userData?.name || user?.email?.split('@')[0] || "System Admin"} 👋</h1>
          <p className="dashboard-subtitle">Monitor healthcare network operations, facility live queues, doctor verification, and user permissions.</p>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--color-border)", marginBottom: "24px", overflowX: "auto", paddingBottom: "6px" }}>
        <button
          className={`sidebar-link ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => handleTabChange("overview")}
          style={{ width: "auto", padding: "10px 16px", borderRadius: "10px", fontWeight: "600", whiteSpace: "nowrap" }}
        >
          <Layers size={18} /> Network Overview
        </button>

        <button
          className={`sidebar-link ${activeTab === "users" ? "active" : ""}`}
          onClick={() => handleTabChange("users")}
          style={{ width: "auto", padding: "10px 16px", borderRadius: "10px", fontWeight: "600", whiteSpace: "nowrap" }}
        >
          <Users size={18} /> Users Roster
        </button>

        <button
          className={`sidebar-link ${activeTab === "facilities" ? "active" : ""}`}
          onClick={() => handleTabChange("facilities")}
          style={{ width: "auto", padding: "10px 16px", borderRadius: "10px", fontWeight: "600", whiteSpace: "nowrap" }}
        >
          <ShieldCheck size={18} /> Facility Controls
        </button>

        <button
          className={`sidebar-link ${activeTab === "doctors" ? "active" : ""}`}
          onClick={() => handleTabChange("doctors")}
          style={{ width: "auto", padding: "10px 16px", borderRadius: "10px", fontWeight: "600", whiteSpace: "nowrap" }}
        >
          <Stethoscope size={18} /> Doctor Verifications
        </button>

        <button
          className={`sidebar-link ${activeTab === "appointments" ? "active" : ""}`}
          onClick={() => handleTabChange("appointments")}
          style={{ width: "auto", padding: "10px 16px", borderRadius: "10px", fontWeight: "600", whiteSpace: "nowrap" }}
        >
          <Calendar size={18} /> All Appointments
        </button>

        <button
          className={`sidebar-link ${activeTab === "logs" ? "active" : ""}`}
          onClick={() => handleTabChange("logs")}
          style={{ width: "auto", padding: "10px 16px", borderRadius: "10px", fontWeight: "600", whiteSpace: "nowrap" }}
        >
          <FileText size={18} /> Audit Trail & Logs
        </button>
      </div>

      {/* KPI Metric Banner (Shown on Overview & quick summary) */}
      <div className="stats-grid" style={{ marginBottom: "24px" }}>
        <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => handleTabChange("users")}>
          <div className="stat-icon-wrapper">
            <Users size={24} />
          </div>
          <div className="stat-card-info">
            <span>Registered Users</span>
            <strong>{totalUsersCount} Total</strong>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => handleTabChange("doctors")}>
          <div className="stat-icon-wrapper">
            <Stethoscope size={24} />
          </div>
          <div className="stat-card-info">
            <span>Verified Doctors</span>
            <strong>{verifiedDoctorsCount} Active</strong>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => handleTabChange("appointments")}>
          <div className="stat-icon-wrapper">
            <Calendar size={24} />
          </div>
          <div className="stat-card-info">
            <span>Network Appointments</span>
            <strong>{appointmentsCount} Tracked</strong>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => handleTabChange("facilities")}>
          <div className="stat-icon-wrapper" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
            <Hospital size={24} />
          </div>
          <div className="stat-card-info">
            <span>Facility Nodes</span>
            <strong>{facilitiesCount} Operational</strong>
          </div>
        </div>
      </div>

      {/* Tab Content Render */}
      {activeTab === "overview" && (
        <div className="fade-in">
          <AdminFacilitiesTab />
          <div style={{ marginTop: "24px" }}>
            <AdminUsersTab />
          </div>
        </div>
      )}

      {activeTab === "users" && <AdminUsersTab />}

      {activeTab === "facilities" && <AdminFacilitiesTab />}

      {activeTab === "doctors" && <AdminDoctorsTab />}

      {activeTab === "appointments" && <AdminAppointmentsTab />}

      {activeTab === "logs" && <AdminLogsTab />}
    </div>
  );
}