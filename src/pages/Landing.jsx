import { Link } from "react-router-dom";
import {
  Activity,
  MapPin,
  Clock,
  Bot,
  ArrowRight,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="landing-page">

      <nav className="navbar">

        <Link
          to="/"
          className="logo"
        >
          <Activity size={28} />
          MediPulse
        </Link>

        <div className="nav-links">
          <Link to="/about">
            About
          </Link>

          <Link
            to="/login"
            className="nav-login"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="nav-button"
          >
            Get Started
          </Link>
        </div>

      </nav>


      <main className="hero">

        <div className="hero-badge">
          <span className="status-dot"></span>
          Real-time healthcare
        </div>

        <h1>
          Healthcare that
          <span> moves with you.</span>
        </h1>

        <p>
          Know whether your doctor is available,
          join the queue remotely, find nearby
          healthcare facilities and get basic
          health assistance — all in one place.
        </p>

        <div className="hero-buttons">

          <Link
            to="/register"
            className="primary-button"
          >
            Get Started
            <ArrowRight size={18} />
          </Link>

          <Link
            to="/about"
            className="secondary-button"
          >
            Explore MediPulse
          </Link>

        </div>


        <div className="feature-grid">

          <div className="feature-card">
            <MapPin size={25} />
            <h3>Live Availability</h3>
            <p>
              Know if a doctor is currently
              available before travelling.
            </p>
          </div>

          <div className="feature-card">
            <Clock size={25} />
            <h3>Smart Queue</h3>
            <p>
              Get your token remotely and
              track the live queue.
            </p>
          </div>

          <div className="feature-card">
            <Bot size={25} />
            <h3>AI Health Assistant</h3>
            <p>
              Get basic guidance for minor
              health concerns.
            </p>
          </div>

        </div>

      </main>

    </div>
  );
}