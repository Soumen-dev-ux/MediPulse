import { Link } from "react-router-dom";
import {
  Activity,
  MapPin,
  Clock,
  Bot,
  ArrowRight,
  ShieldCheck,
  Users,
  CheckCircle2
} from "lucide-react";

export default function Landing() {
  return (
    <div className="landing-page fade-in">
      <main className="hero">
        <div className="hero-badge">
          <span className="status-dot-pulse" style={{ background: "var(--color-primary-light)" }}></span>
          <span>Real-time Healthcare Queue Network Active</span>
        </div>

        <h1>
          Healthcare that
          <span> moves with you.</span>
        </h1>

        <p>
          Know whether your doctor is available before traveling, join queue lines remotely, 
          find nearby clinics, and access AI health assistance — all from one unified platform.
        </p>

        <div className="hero-buttons">
          <Link to="/register" className="primary-button">
            Get Started Free
            <ArrowRight size={18} />
          </Link>

          <Link to="/about" className="secondary-button">
            Explore MediPulse Network
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="feature-grid">
          <div className="feature-card">
            <div className="stat-icon-wrapper" style={{ marginBottom: "16px" }}>
              <MapPin size={24} />
            </div>
            <h3>Live Availability</h3>
            <p>
              Check doctor availability in real-time before stepping out of your house. Avoid wasted hospital trips.
            </p>
          </div>

          <div className="feature-card">
            <div className="stat-icon-wrapper" style={{ marginBottom: "16px" }}>
              <Clock size={24} />
            </div>
            <h3>Smart Queue Token</h3>
            <p>
              Get your consultation queue token remotely, track live serving tokens, and arrive right when it's your turn.
            </p>
          </div>

          <div className="feature-card">
            <div className="stat-icon-wrapper" style={{ marginBottom: "16px" }}>
              <Bot size={24} />
            </div>
            <h3>AI Health Assistant</h3>
            <p>
              Describe symptoms to receive instant preliminary guidance, triage advice, and emergency recommendations 24/7.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}