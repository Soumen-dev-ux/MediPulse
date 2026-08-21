import { Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  FileText,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  UserCheck,
  Radio
} from "lucide-react";

export default function Landing() {
  return (
    <div className="landing-page fade-in" style={{ overflow: "hidden", position: "relative" }}>
      {/* Background ambient lighting */}
      <div style={{
        position: "absolute",
        top: "-100px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "700px",
        height: "400px",
        background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.08) 50%, rgba(0,0,0,0) 80%)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <main className="hero" style={{ position: "relative", zIndex: 1 }}>
        {/* Real-time status pill */}
        <div className="hero-badge" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 18px",
          borderRadius: "30px",
          background: "rgba(16, 185, 129, 0.12)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "var(--color-primary-light)",
          fontSize: "13px",
          fontWeight: "600",
          marginBottom: "24px"
        }}>
          <span className="status-dot-pulse" style={{ background: "var(--color-primary-light)" }}></span>
          <span>MediPulse Live Socket Engine Active · 99.9% Uptime</span>
        </div>

        <h1 style={{
          fontSize: "clamp(42px, 6vw, 68px)",
          fontWeight: "800",
          letterSpacing: "-1.5px",
          lineHeight: "1.1",
          marginBottom: "20px"
        }}>
          Healthcare that{" "}
          <span style={{
            background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            moves with you.
          </span>
        </h1>

        <p style={{
          fontSize: "18px",
          color: "var(--color-text-secondary)",
          maxWidth: "680px",
          margin: "0 auto 36px",
          lineHeight: "1.6"
        }}>
          Know whether your doctor is available before leaving home, track live queue token numbers in real time, find nearby clinics, and manage prescriptions — all in one platform.
        </p>

        <div className="hero-buttons" style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "50px", flexWrap: "wrap" }}>
          <Link to="/register" className="primary-button" style={{ padding: "14px 28px", fontSize: "15px", borderRadius: "14px" }}>
            Get Started Free
            <ArrowRight size={18} />
          </Link>

          <Link to="/about" className="secondary-button" style={{ padding: "14px 28px", fontSize: "15px", borderRadius: "14px" }}>
            Explore MediPulse Network
          </Link>
        </div>

        {/* Live Interactive Preview Card */}
        <div style={{
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "24px",
          padding: "28px",
          maxWidth: "840px",
          margin: "0 auto 60px",
          boxShadow: "var(--shadow-lg)",
          backdropFilter: "blur(16px)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--color-border)", paddingBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Radio size={18} style={{ color: "#10b981" }} />
              <strong style={{ fontSize: "14px" }}>Live Queue Counter Demo · City Central Hospital</strong>
            </div>
            <span className="status-badge confirmed" style={{ padding: "4px 12px", fontSize: "12px" }}>
              <Zap size={12} /> Socket.IO Connected
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", textAlign: "left" }}>
            <div style={{ background: "var(--color-bg-elevated)", padding: "18px", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)" }}>YOUR TOKEN</span>
              <p style={{ fontSize: "28px", fontWeight: "800", color: "var(--color-primary-light)", marginTop: "2px" }}>#A-14</p>
            </div>
            <div style={{ background: "var(--color-bg-elevated)", padding: "18px", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)" }}>CURRENTLY SERVING</span>
              <p style={{ fontSize: "28px", fontWeight: "800", color: "#60a5fa", marginTop: "2px" }}>#A-13</p>
            </div>
            <div style={{ background: "var(--color-bg-elevated)", padding: "18px", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)" }}>ESTIMATED WAIT</span>
              <p style={{ fontSize: "28px", fontWeight: "800", color: "var(--color-warning)", marginTop: "2px" }}>10 mins</p>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
          <div className="feature-card" style={{
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "20px",
            padding: "28px",
            textAlign: "left",
            transition: "all 0.3s ease"
          }}>
            <div className="stat-icon-wrapper" style={{ marginBottom: "20px", width: "48px", height: "48px", borderRadius: "14px" }}>
              <MapPin size={24} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Live Doctor Status</h3>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: "1.5" }}>
              Check doctor presence in real-time before stepping out of your house. Eliminate long waiting room delays.
            </p>
          </div>

          <div className="feature-card" style={{
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "20px",
            padding: "28px",
            textAlign: "left",
            transition: "all 0.3s ease"
          }}>
            <div className="stat-icon-wrapper" style={{ marginBottom: "20px", width: "48px", height: "48px", borderRadius: "14px", background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Smart Queue Tokens</h3>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: "1.5" }}>
              Get your consultation token remotely, track live serving numbers on your phone, and arrive right on time.
            </p>
          </div>

          <div className="feature-card" style={{
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "20px",
            padding: "28px",
            textAlign: "left",
            transition: "all 0.3s ease"
          }}>
            <div className="stat-icon-wrapper" style={{ marginBottom: "20px", width: "48px", height: "48px", borderRadius: "14px" }}>
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Digital Prescriptions</h3>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: "1.5" }}>
              Access physician prescriptions securely, view dosage guidance, and request pharmacy refills seamlessly.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}