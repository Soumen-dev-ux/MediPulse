import { useState } from "react";
import { useAuth } from "../../Context/useAuth";
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Search, 
  Stethoscope, 
  PhoneCall, 
  FileText,
  AlertCircle
} from "lucide-react";

const DoctorDashboard = () => {
  const { user, userData } = useAuth();
  const [statusMode, setStatusMode] = useState("present"); // 'present' | 'consultation' | 'away'
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const patientsList = [
    { token: "#A-12", name: "Rahul Sharma", time: "10:00 AM", type: "General Consultation", status: "completed" },
    { token: "#A-13", name: "Ananya Roy", time: "10:15 AM", type: "Cardiology Follow-up", status: "completed" },
    { token: "#A-14", name: "Soumen Pore", time: "10:30 AM", type: "ECG & Heart Checkup", status: "next" },
    { token: "#A-15", name: "Priya Das", time: "11:00 AM", type: "Blood Pressure Review", status: "waiting" },
    { token: "#A-16", name: "Amitav Ghosh", time: "11:30 AM", type: "Chest Pain Initial", status: "waiting" },
  ];

  const filteredPatients = patientsList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.token.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "next") return matchesSearch && p.status === "next";
    if (activeTab === "waiting") return matchesSearch && p.status === "waiting";
    if (activeTab === "completed") return matchesSearch && p.status === "completed";
    return matchesSearch;
  });

  return (
    <div className="dashboard fade-in">
      {/* Header Bar */}
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">DOCTOR PORTAL · CLINIC QUEUE ENGINE</p>
          <h1>Welcome, Dr. {userData?.name || user?.email?.split('@')[0] || "Doctor"} 👋</h1>
          <p className="dashboard-subtitle">Manage today's appointments, live queue status, and patient consults.</p>
        </div>
      </div>

      {/* Doctor Availability Bar */}
      <div className="doctor-status-card">
        <div className="doctor-status-left">
          <div className="doctor-status-icon">
            <UserCheck size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Live Availability Status</h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "13px", marginTop: "2px" }}>
              Current Status:{" "}
              <strong style={{ 
                color: statusMode === "present" ? "var(--color-primary-light)" : statusMode === "consultation" ? "var(--color-info)" : "var(--color-warning)" 
              }}>
                {statusMode === "present" ? "Present & Accepting Patients" : statusMode === "consultation" ? "In Consultation (Busy)" : "Marked Away / On Break"}
              </strong>
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            className={`status-toggle-btn ${statusMode === "present" ? "active" : ""}`}
            onClick={() => setStatusMode("present")}
          >
            Present
          </button>
          <button 
            className={`status-toggle-btn ${statusMode === "consultation" ? "active" : ""}`}
            onClick={() => setStatusMode("consultation")}
          >
            In Consult
          </button>
          <button 
            className={`status-toggle-btn ${statusMode === "away" ? "active" : ""}`}
            onClick={() => setStatusMode("away")}
          >
            Mark Away
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Calendar size={26} />
          </div>
          <div className="stat-card-info">
            <span>Today's Schedule</span>
            <strong>12 Booked</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
            <Users size={26} />
          </div>
          <div className="stat-card-info">
            <span>In Queue Waiting</span>
            <strong>3 Patients</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <CheckCircle2 size={26} />
          </div>
          <div className="stat-card-info">
            <span>Completed</span>
            <strong>2 Consulted</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--color-warning)" }}>
            <Clock size={26} />
          </div>
          <div className="stat-card-info">
            <span>Avg Consult Time</span>
            <strong>12 mins</strong>
          </div>
        </div>
      </div>

      {/* Patient Schedule Table Panel */}
      <div className="card-panel">
        <div className="panel-title-bar" style={{ flexWrap: "wrap", gap: "16px" }}>
          <h2>Today's Patient Schedule</h2>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div className="nav-center-search" style={{ width: "240px" }}>
              <Search size={15} />
              <input 
                type="text" 
                placeholder="Search patient name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {["all", "next", "waiting", "completed"].map((tab) => (
                <button
                  key={tab}
                  className={`status-toggle-btn ${activeTab === tab ? "active" : ""}`}
                  style={{ textTransform: "capitalize", padding: "6px 12px", fontSize: "12px" }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="patient-queue-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Patient Name</th>
                <th>Time Slot</th>
                <th>Visit Purpose</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.token}>
                  <td>
                    <strong style={{ color: "var(--color-primary-light)" }}>{patient.token}</strong>
                  </td>
                  <td>
                    <strong>{patient.name}</strong>
                  </td>
                  <td>{patient.time}</td>
                  <td>{patient.type}</td>
                  <td>
                    {patient.status === "completed" && <span className="status-badge confirmed">Completed</span>}
                    {patient.status === "next" && <span className="status-badge confirmed"><span className="status-dot-pulse"></span> Next Up</span>}
                    {patient.status === "waiting" && <span className="status-badge away">Waiting</span>}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button 
                        className="secondary-button" 
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => alert(`Calling patient ${patient.name} (${patient.token}) to Consultation Room 3...`)}
                      >
                        <PhoneCall size={13} /> Call
                      </button>
                      <button 
                        className="primary-button" 
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => alert(`Opening EHR records and prescription writer for ${patient.name}...`)}
                      >
                        <FileText size={13} /> Records
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;