import {
  LayoutDashboard,
  MapPin,
  Clock,
  Pill,
  Bot,
  AlertTriangle,
  Info,
  Users,
  ShieldCheck,
  Calendar,
  PhoneCall,
  Activity,
  HeartPulse
} from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Sidebar({ role = "patient", isCollapsed, onCloseMobile, onOpenSOS }) {
  const patientLinks = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/patient" },
    { label: "Find Healthcare", icon: MapPin, path: "/patient/healthcare" },
    { label: "My Queue Status", icon: Clock, path: "/patient/queue" },
    { label: "Prescriptions", icon: Pill, path: "/patient/prescription" },
  ];

  const doctorLinks = [
    { label: "Doctor Portal", icon: LayoutDashboard, path: "/doctor" },
    { label: "Appointments Schedule", icon: Calendar, path: "/doctor" },
    { label: "Patient Records", icon: Users, path: "/doctor" },
  ];

  const adminLinks = [
    { label: "Admin Console", icon: LayoutDashboard, path: "/admin" },
    { label: "Users Overview", icon: Users, path: "/admin" },
    { label: "Facility Controls", icon: ShieldCheck, path: "/admin" },
  ];

  const activeLinks = role === "admin" ? adminLinks : role === "doctor" ? doctorLinks : patientLinks;

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-nav-group">
        <div className="sidebar-label">
          {role.toUpperCase()} NAVIGATION
        </div>

        {activeLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={onCloseMobile}
            >
              <Icon size={19} />
              <span className="link-text">{item.label}</span>
            </NavLink>
          );
        })}

        <div className="sidebar-label">GENERAL</div>

        <NavLink
          to="/about"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          onClick={onCloseMobile}
        >
          <Info size={19} />
          <span className="link-text">About MediPulse</span>
        </NavLink>
      </div>

      {!isCollapsed && (
        <div className="sidebar-widget-card">
          {role === "patient" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary-light)", marginBottom: "6px" }}>
                <AlertTriangle size={18} />
                <h4>Emergency SOS</h4>
              </div>
              <p>Instant hotline & nearest hospital dispatch.</p>
              <button 
                className="danger-button full" 
                style={{ padding: "8px 12px", fontSize: "12px" }}
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  if (onOpenSOS) onOpenSOS();
                }}
              >
                <PhoneCall size={14} /> Call Emergency
              </button>
            </>
          )}

          {role === "doctor" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary-light)", marginBottom: "6px" }}>
                <HeartPulse size={18} />
                <h4>Shift Active</h4>
              </div>
              <p>Queue sync is active for today's visits.</p>
            </>
          )}

          {role === "admin" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary-light)", marginBottom: "6px" }}>
                <Activity size={18} />
                <h4>Network Status</h4>
              </div>
              <p>All 14 connected clinics online.</p>
            </>
          )}
        </div>
      )}
    </aside>
  );
}