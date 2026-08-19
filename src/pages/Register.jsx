import { Link } from "react-router-dom";
import {
  Activity,
  UserCheck,
  Stethoscope,
  Building2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Phone,
  FileText,
  Clock,
} from "lucide-react";

export default function Register() {
  return (
    <div className="registration-page registration-page--chooser fade-in">
      <div className="registration-shell">
        {/* Logo */}
        <div className="registration-hero">
          <Link to="/" className="registration-brand">
            <div className="logo-icon-wrapper">
              <Activity size={22} />
            </div>
            MediPulse
          </Link>
          <h1>
            Join MediPulse
          </h1>
          <p>
            Choose your role to get started with the right registration flow.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="register-role-grid">
          {/* Patient Card */}
          <Link to="/register/patient" className="role-card role-card-patient">
            <div className="role-card-icon">
              <UserCheck size={32} />
            </div>
            <div className="role-card-badge">Most Common</div>
            <h2 className="role-card-title">Patient</h2>
            <p className="role-card-desc">
              Find nearby clinics, track live queues and book appointments.
            </p>
            <ul className="role-card-features">
              <li><MapPin size={14} /> Real-time doctor availability</li>
              <li><Clock size={14} /> Smart queue token system</li>
              <li><FileText size={14} /> Digital prescriptions</li>
              <li><ShieldCheck size={14} /> Privacy-protected profile</li>
            </ul>
            <div className="role-card-cta">
              Register as Patient <ArrowRight size={16} />
            </div>
          </Link>

          {/* Doctor Card */}
          <Link to="/register/doctor" className="role-card role-card-doctor">
            <div className="role-card-icon">
              <Stethoscope size={32} />
            </div>
            <div className="role-card-badge role-card-badge-blue">Professional</div>
            <h2 className="role-card-title">Doctor</h2>
            <p className="role-card-desc">
              Manage your patient queue, issue digital prescriptions, and broadcast live availability status.
            </p>
            <ul className="role-card-features">
              <li><Clock size={14} /> Live queue management</li>
              <li><FileText size={14} /> EHR & digital prescriptions</li>
              <li><Phone size={14} /> Public contact listing</li>
              <li><ShieldCheck size={14} /> Credential verification</li>
            </ul>
            <div className="role-card-cta">
              Register as Doctor <ArrowRight size={16} />
            </div>
          </Link>

          {/* Clinic Card */}
          <Link to="/register/clinic" className="role-card role-card-clinic">
            <div className="role-card-icon">
              <Building2 size={32} />
            </div>
            <div className="role-card-badge role-card-badge-purple">Facility</div>
            <h2 className="role-card-title">Clinic / Nursing Home</h2>
            <p className="role-card-desc">
              Register your facility, manage pharmacy services, configure delivery, and join the MediPulse network.
            </p>
            <ul className="role-card-features">
              <li><MapPin size={14} /> Geolocation listing on map</li>
              <li><Building2 size={14} /> Pharmacy & delivery setup</li>
              <li><FileText size={14} /> License & regulatory details</li>
              <li><ShieldCheck size={14} /> Network verification</li>
            </ul>
            <div className="role-card-cta">
              Register Facility <ArrowRight size={16} />
            </div>
          </Link>
        </div>

        <p className="registration-signin">
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--color-primary-light)", fontWeight: "600" }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
