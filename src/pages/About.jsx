import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  MapPin,
  HeartPulse,
  Users,
  ArrowLeft,
  Clock,
  Bot,
  ShieldCheck,
  Hospital,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function About() {
  const [selectedHospital, setSelectedHospital] = useState(0);

  const hospitalsData = [
    {
      id: 0,
      name: "City Central Hospital",
      location: "Main Campus · Block B, Floor 3",
      category: "Multi-Specialty & Cardiology",
      status: "Operational",
      doctorsPresent: 14,
      queueServing: "#A-14",
      avgWait: "14 mins",
      coords: { top: "25%", left: "30%" }
    },
    {
      id: 1,
      name: "Metro Cardiac Center",
      location: "South Wing · Building 2",
      category: "Cardiology & Intensive Care",
      status: "Operational",
      doctorsPresent: 8,
      queueServing: "#C-08",
      avgWait: "10 mins",
      coords: { top: "60%", left: "68%" }
    },
    {
      id: 2,
      name: "Apex Emergency Care",
      location: "East Avenue · Entrance 1",
      category: "24/7 Trauma & Emergency",
      status: "High Capacity",
      doctorsPresent: 22,
      queueServing: "#E-42",
      avgWait: "5 mins",
      coords: { top: "35%", left: "75%" }
    },
    {
      id: 3,
      name: "Sunrise Community Clinic",
      location: "West District · Health Hub",
      category: "General Medicine & Pediatrics",
      status: "Operational",
      doctorsPresent: 6,
      queueServing: "#G-05",
      avgWait: "8 mins",
      coords: { top: "70%", left: "22%" }
    }
  ];

  const currentHospital = hospitalsData[selectedHospital];

  return (
    <div className="about-page fade-in">
      <Link to="/" className="back-link">
        <ArrowLeft size={18} />
        Back to Home
      </Link>

      {/* Hero Section */}
      <div className="about-hero">
        <div className="hero-badge">
          <Activity size={16} />
          <span>About MediPulse Platform</span>
        </div>

        <h1>Healthcare shouldn't begin with waiting.</h1>

        <p>
          MediPulse connects patients, doctors, and healthcare facilities in real-time — eliminating uncertain hospital visits, 
          streamlining queues, and providing instant AI health guidance.
        </p>
      </div>

      {/* Impact Stats Bar */}
      <div className="about-stats-bar">
        <div className="about-stat-box">
          <strong>14+</strong>
          <span>Connected Hospitals</span>
        </div>
        <div className="about-stat-box">
          <strong>1,240+</strong>
          <span>Active Patients</span>
        </div>
        <div className="about-stat-box">
          <strong>99.8%</strong>
          <span>Queue Sync Accuracy</span>
        </div>
        <div className="about-stat-box">
          <strong>12 mins</strong>
          <span>Avg Reduced Wait Time</span>
        </div>
      </div>

      {/* Core Mission Cards */}
      <div className="about-grid">
        <div className="about-card">
          <div className="stat-icon-wrapper" style={{ marginBottom: "16px" }}>
            <MapPin size={24} />
          </div>
          <h3>Know Before You Go</h3>
          <p>
            Check real-time doctor availability and hospital capacity before stepping out, avoiding unnecessary travel and long waiting room delays.
          </p>
        </div>

        <div className="about-card">
          <div className="stat-icon-wrapper" style={{ marginBottom: "16px" }}>
            <Clock size={24} />
          </div>
          <h3>Smart Synchronized Queue</h3>
          <p>
            Generate digital tokens remotely or via phone. Both smartphone users and walk-in callers share a unified, transparent real-time queue.
          </p>
        </div>

        <div className="about-card">
          <div className="stat-icon-wrapper" style={{ marginBottom: "16px" }}>
            <Bot size={24} />
          </div>
          <h3>AI Health Assistant</h3>
          <p>
            Access 24/7 symptom guidance, triage recommendations, and direct emergency escalation for urgent health concerns.
          </p>
        </div>
      </div>

      {/* Interactive Network Map Radar Section */}
      <div className="map-visual-container">
        <div className="map-header">
          <div>
            <span className="eyebrow">REAL-TIME HEALTHCARE RADAR</span>
            <h2 style={{ fontSize: "22px", fontWeight: "800" }}>Live Connected Facility Map</h2>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {hospitalsData.map((h, idx) => (
              <button
                key={h.name}
                className={`status-toggle-btn ${selectedHospital === idx ? "active" : ""}`}
                style={{ fontSize: "12px", padding: "6px 12px" }}
                onClick={() => setSelectedHospital(idx)}
              >
                {h.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="map-radar-viewport">
          <div className="radar-grid-bg" />
          <div className="radar-sweep" />

          {/* Interactive Hospital Pin Nodes */}
          {hospitalsData.map((hospital, index) => (
            <div
              key={hospital.name}
              className={`hospital-pin-node ${selectedHospital === index ? "selected" : ""}`}
              style={{ top: hospital.coords.top, left: hospital.coords.left }}
              onClick={() => setSelectedHospital(index)}
            >
              <div className="status-dot-pulse" style={{ background: "var(--color-primary-light)" }} />
              <Hospital size={16} style={{ color: "var(--color-primary-light)" }} />
              <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-text-primary)" }}>
                {hospital.name}
              </span>
            </div>
          ))}
        </div>

        {/* Selected Hospital Info Detail Panel */}
        <div className="doctor-info-box" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span className="facility-category">{currentHospital.category}</span>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginTop: "2px" }}>{currentHospital.name}</h3>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
              <MapPin size={14} style={{ display: "inline", marginRight: "4px" }} />
              {currentHospital.location}
            </p>
          </div>

          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "block", textTransform: "uppercase", fontWeight: "700" }}>Doctors On Duty</span>
              <strong style={{ fontSize: "18px", color: "var(--color-primary-light)" }}>{currentHospital.doctorsPresent} Active</strong>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "block", textTransform: "uppercase", fontWeight: "700" }}>Currently Serving</span>
              <strong style={{ fontSize: "18px", color: "var(--color-text-primary)" }}>{currentHospital.queueServing}</strong>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "block", textTransform: "uppercase", fontWeight: "700" }}>Est. Wait Time</span>
              <strong style={{ fontSize: "18px", color: "var(--color-info)" }}>{currentHospital.avgWait}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Footer Section */}
      <div 
        className="card-panel" 
        style={{ 
          textAlign: "center", 
          padding: "48px 24px", 
          background: "radial-gradient(circle at center, rgba(16, 185, 129, 0.15), transparent 70%), var(--color-bg-surface)" 
        }}
      >
        <h2 style={{ fontSize: "28px", fontWeight: "800" }}>Ready to transform your healthcare experience?</h2>
        <p style={{ color: "var(--color-text-secondary)", maxWidth: "550px", margin: "10px auto 24px" }}>
          Join thousands of patients and healthcare providers managing appointments and queues seamlessly with MediPulse.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "14px" }}>
          <Link to="/register" className="primary-button">
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="secondary-button">
            Sign In to Account
          </Link>
        </div>
      </div>
    </div>
  );
}