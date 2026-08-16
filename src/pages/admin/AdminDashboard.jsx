import { useState, useEffect } from "react";
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
  Phone
} from "lucide-react";
import { 
  subscribeToFacility, 
  serveNextPatient, 
  generateQueueToken, 
  resetQueueToken 
} from "../../firebase/facilities";

const AdminDashboard = () => {
  const { user, userData } = useAuth();
  const [phonePatientNumber, setPhonePatientNumber] = useState("");
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentToken = facility?.currentToken ?? 0;

  const handleNextToken = async () => {
    try {
      await serveNextPatient();
    } catch (error) {
      console.error("Failed to serve next patient:", error);
    }
  };

  const handleResetToken = async () => {
    if (window.confirm("Are you sure you want to reset the live queue token counter to #A-1?")) {
      try {
        await resetQueueToken();
      } catch (error) {
        console.error("Failed to reset token counter:", error);
      }
    }
  };

  const handleIssuePhoneToken = async (e) => {
    e.preventDefault();
    if (!phonePatientNumber) return;
    try {
      const newToken = await generateQueueToken();
      alert(`Issued Queue Token #A-${newToken} for walk-in/phone patient (${phonePatientNumber}). SMS notification dispatched!`);
      setPhonePatientNumber("");
    } catch (error) {
      console.error("Failed to issue token:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeToFacility((data) => {
      if (isMounted) {
        setFacility(data);
        setLoading(false);
      }
    });

    const timer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 1500);

    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading facility...</p>
      </div>
    );
  }

  return (
    <div className="dashboard fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">ADMINISTRATOR CONSOLE · SYSTEM OVERVIEW</p>
          <h1>Welcome, {userData?.name || user?.email?.split('@')[0] || "Admin"} 👋</h1>
          <p className="dashboard-subtitle">Monitor healthcare network operations, facility live queues, and user permissions.</p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Users size={26} />
          </div>
          <div className="stat-card-info">
            <span>Registered Users</span>
            <strong>1,240 Total</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Stethoscope size={26} />
          </div>
          <div className="stat-card-info">
            <span>Verified Doctors</span>
            <strong>126 Active</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Calendar size={26} />
          </div>
          <div className="stat-card-info">
            <span>Total Appointments</span>
            <strong>3,420 Completed</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
            <Hospital size={26} />
          </div>
          <div className="stat-card-info">
            <span>Facility Nodes</span>
            <strong>14 Operational</strong>
          </div>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="dashboard-section">
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "18px" }}>Network & Live Queue Controls</h2>
        <div className="admin-grid">
          {/* Facility Availability Card */}
          <div className="admin-card">
            <div>
              <div className="card-header">
                <div className="card-icon">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Facility Network Status</h3>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>City Central Hospital (Main Campus)</p>
                </div>
              </div>

              <div style={{ margin: "20px 0" }}>
                <span className="status-badge confirmed" style={{ padding: "8px 16px", fontSize: "13px" }}>
                  <span className="status-dot-pulse"></span> Network Operational · 100% Uptime
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                Real-time queue synchronization, emergency hotline routing, and doctor availability broadcasting active.
              </p>
            </div>

            <button 
              className="secondary-button full" 
              onClick={() => alert("Opening facility configuration & doctor schedule manager...")}
            >
              Manage Facility Settings
            </button>
          </div>

          {/* Live Queue Token Modifier Card */}
          <div className="admin-card">
            <div>
              <div className="card-header">
                <div className="card-icon">
                  <Activity size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Live Queue Token Controller</h3>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>Real-time queue counter for Cardiology</p>
                </div>
              </div>

              <div className="queue-display-box" style={{ margin: "16px 0" }}>
                <span>CURRENTLY SERVING TOKEN</span>
                <strong>#A-{currentToken}</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                className="primary-button" 
                style={{ flex: 1 }}
                onClick={handleNextToken}
              >
                <ChevronRight size={16} /> Serve Next Token (#A-{currentToken + 1})
              </button>
              <button 
                className="secondary-button"
                onClick={handleResetToken}
                title="Reset Token Counter"
              >
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Phone/Walk-in Patient Token Dispenser */}
      <div className="card-panel" style={{ marginBottom: "24px" }}>
        <div className="panel-title-bar">
          <h2>Walk-in & Phone Patient Token Dispenser</h2>
        </div>
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
          Issue digital queue tokens for walk-in patients or phone callers who do not have smartphones.
        </p>

        <form onSubmit={handleIssuePhoneToken} style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <div className="input-wrapper" style={{ flex: 1 }}>
            <Phone size={18} />
            <input 
              type="tel" 
              placeholder="Enter patient phone number (+91XXXXXXXXXX)..." 
              value={phonePatientNumber}
              onChange={(e) => setPhonePatientNumber(e.target.value)}
              required
            />
          </div>
          <button className="primary-button" type="submit">
            <Plus size={18} /> Issue Token
          </button>
        </form>
      </div>

      {/* User Permissions & Role Management */}
      <div className="card-panel">
        <div className="panel-title-bar">
          <h2>Registered Healthcare System Users</h2>
          <span className="status-badge confirmed">Real-time DB Active</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="patient-queue-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Assigned Role</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>usr_01</td>
                <td><strong>Dr. Sharma</strong></td>
                <td>doctor@medipulse.org</td>
                <td><span className="status-badge confirmed" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>Doctor</span></td>
                <td>Active Specialist</td>
                <td style={{ textAlign: "right" }}>
                  <button className="secondary-button" style={{ padding: "4px 10px", fontSize: "11px" }} onClick={() => alert("Updated doctor permissions for Dr. Sharma.")}>Edit Role</button>
                </td>
              </tr>
              <tr>
                <td>usr_02</td>
                <td><strong>Soumen Pore</strong></td>
                <td>patient@medipulse.org</td>
                <td><span className="status-badge confirmed">Patient</span></td>
                <td>Verified Patient</td>
                <td style={{ textAlign: "right" }}>
                  <button className="secondary-button" style={{ padding: "4px 10px", fontSize: "11px" }} onClick={() => alert("Updated patient record permissions.")}>Edit Role</button>
                </td>
              </tr>
              <tr>
                <td>usr_03</td>
                <td><strong>System Admin</strong></td>
                <td>admin@medipulse.org</td>
                <td><span className="status-badge away" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5" }}>Admin</span></td>
                <td>Super Admin</td>
                <td style={{ textAlign: "right" }}>
                  <button className="secondary-button" style={{ padding: "4px 10px", fontSize: "11px" }} onClick={() => alert("Admin credentials protected.")}>Manage</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;