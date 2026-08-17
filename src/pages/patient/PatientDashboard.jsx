import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/useAuth";
import { logoutUser } from "../../firebase/auth";
import { 
  Calendar, 
  FileText, 
  MapPin, 
  Clock, 
  Stethoscope, 
  Bot, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  PhoneCall,
  Activity,
  PlusCircle
} from "lucide-react";

const PatientDashboard = ({ onOpenBookModal, onOpenAIModal, onOpenSOS }) => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const isCancelled = localStorage.getItem("medipulse_token_cancelled") === "true";
  const savedToken = localStorage.getItem("medipulse_user_token");
  const queueToken = isCancelled ? "Cancelled" : savedToken ? `#A-${savedToken}` : "#A-14";
  const [estimatedWait, setEstimatedWait] = useState("18 mins");

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="dashboard fade-in">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">PATIENT DASHBOARD · {formattedDate}</p>
          <h1>Welcome back, {userData?.name || user?.email?.split('@')[0] || "Patient"} 👋</h1>
          <p className="dashboard-subtitle">Monitor live healthcare queues, upcoming visits, and active prescriptions.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            className="primary-button" 
            onClick={onOpenBookModal}
          >
            <PlusCircle size={18} />
            Book Appointment
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => navigate("/patient/healthcare")}>
          <div className="stat-icon-wrapper">
            <Calendar size={26} />
          </div>
          <div className="stat-card-info">
            <span>Upcoming Visits</span>
            <strong>3 Scheduled</strong>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => navigate("/patient/healthcare")}>
          <div className="stat-icon-wrapper">
            <Stethoscope size={26} />
          </div>
          <div className="stat-card-info">
            <span>Assigned Specialists</span>
            <strong>8 Active</strong>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => navigate("/patient/prescription")}>
          <div className="stat-icon-wrapper">
            <FileText size={26} />
          </div>
          <div className="stat-card-info">
            <span>Prescriptions</span>
            <strong>5 Available</strong>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => navigate("/patient/queue")}>
          <div className="stat-icon-wrapper" style={{ background: isCancelled ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)", color: isCancelled ? "#fca5a5" : "#60a5fa" }}>
            <Activity size={26} />
          </div>
          <div className="stat-card-info">
            <span>Queue Status</span>
            <strong>{isCancelled ? "Cancelled" : `Active (${queueToken})`}</strong>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout Grid */}
      <div className="dashboard-layout-grid">
        {/* Left Column: Next Visit & Queue Card */}
        <div className="card-panel">
          <div className="panel-title-bar">
            <h2>Your Next Scheduled Visit</h2>
            <span className="status-badge confirmed">
              <span className="status-dot-pulse"></span> Confirmed & Live
            </span>
          </div>

          <div className="facility-card">
            <div className="facility-top">
              <div>
                <span className="facility-category">CARDIOLOGY & VASCULAR CARE</span>
                <h3>City Central Hospital</h3>
                <p><MapPin size={16} /> Block B, Floor 3, Room 302 · Main Campus</p>
              </div>
            </div>

            <div className="doctor-info-box">
              <div className="doctor-avatar-circle">DS</div>
              <div className="doctor-info-text">
                <strong>Dr. Sharma</strong>
                <p>Senior Cardiologist · MBBS, MD (Cardiology)</p>
              </div>
            </div>

            <div className="queue-token-box">
              <div>
                <span>Appointment Slot</span>
                <strong>Today · 10:30 AM</strong>
              </div>
              <div>
                <span>Live Queue Token</span>
                <strong>{queueToken}</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "6px", flexWrap: "wrap" }}>
              <button 
                className="primary-button" 
                style={{ flex: 1, minWidth: "160px" }}
                onClick={() => navigate("/patient/queue")}
              >
                <Clock size={16} /> Track Live Queue Tracker
              </button>
              <button 
                className="secondary-button"
                onClick={onOpenBookModal}
              >
                Reschedule Slot
              </button>
            </div>
          </div>

          {/* Active Prescriptions Summary */}
          <div className="panel-title-bar" style={{ marginTop: "10px" }}>
            <h2>Active Prescriptions</h2>
            <button className="secondary-button" style={{ padding: "4px 10px", fontSize: "11px" }} onClick={() => navigate("/patient/prescription")}>
              View All
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div className="doctor-info-box" style={{ justifyContent: "space-between", cursor: "pointer" }} onClick={() => navigate("/patient/prescription")}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <FileText size={22} style={{ color: "var(--color-primary-light)" }} />
                <div>
                  <strong>Amoxicillin 500mg</strong>
                  <p style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>1 capsule twice daily · 5 days remaining</p>
                </div>
              </div>
              <span className="status-badge confirmed">Refill Ready</span>
            </div>

            <div className="doctor-info-box" style={{ justifyContent: "space-between", cursor: "pointer" }} onClick={() => navigate("/patient/prescription")}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <FileText size={22} style={{ color: "var(--color-primary-light)" }} />
                <div>
                  <strong>Atorvastatin 10mg</strong>
                  <p style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>1 tablet at bedtime · 14 days remaining</p>
                </div>
              </div>
              <span className="status-badge confirmed">Active</span>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions & Health Tools */}
        <div className="card-panel">
          <div className="panel-title-bar">
            <h2>Quick Actions</h2>
          </div>

          <div className="quick-actions-grid">
            <div 
              className="quick-action-card" 
              onClick={onOpenAIModal}
              style={{ cursor: "pointer" }}
            >
              <div className="action-icon">
                <Bot size={22} />
              </div>
              <div className="action-details">
                <strong>AI Health Assistant</strong>
                <span>Instant symptom guidance & advice</span>
              </div>
            </div>

            <div 
              className="quick-action-card" 
              onClick={() => navigate("/patient/healthcare")}
              style={{ cursor: "pointer" }}
            >
              <div className="action-icon">
                <MapPin size={22} />
              </div>
              <div className="action-details">
                <strong>Find Nearby Clinics</strong>
                <span>Check live doctor availability</span>
              </div>
            </div>

            <div 
              className="quick-action-card" 
              onClick={onOpenBookModal}
              style={{ cursor: "pointer" }}
            >
              <div className="action-icon">
                <Stethoscope size={22} />
              </div>
              <div className="action-details">
                <strong>Book Specialist Visit</strong>
                <span>Reserve consultation appointment</span>
              </div>
            </div>

            <div 
              className="quick-action-card"
              style={{ borderLeft: "4px solid var(--color-danger)", cursor: "pointer" }}
              onClick={onOpenSOS}
            >
              <div className="action-icon" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5" }}>
                <AlertTriangle size={22} />
              </div>
              <div className="action-details">
                <strong style={{ color: "#fca5a5" }}>Emergency SOS Dispatch</strong>
                <span>Dispatch ambulance & alert doctor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;