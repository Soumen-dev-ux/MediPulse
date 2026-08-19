import { Sun, Moon, Menu, Activity, LogOut, Search, Bell } from "lucide-react";
import { ThemeContext } from "../Context/theme-context";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../Context/useAuth";
import { logoutUser } from "../firebase/auth";

export default function Navbar({ isDashboardRoute, toggleSidebar }) {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const getInitials = (name, email) => {
    if (name) {
      const parts = name.split(" ");
      return parts.length >= 2 
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() 
        : name.slice(0, 2).toUpperCase();
    }
    return email ? email.slice(0, 2).toUpperCase() : "MP";
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        {isDashboardRoute && (
          <button 
            className="nav-toggle-btn" 
            onClick={toggleSidebar} 
            aria-label="Toggle navigation menu"
            title="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
        )}

        <Link to="/" className="logo">
          <div className="logo-icon-wrapper">
            <Activity size={22} />
          </div>
          <span>MediPulse</span>
        </Link>
      </div>

      {isDashboardRoute && (
        <div className="nav-center-search">
          <Search size={16} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search facilities, doctors, appointments..." 
            aria-label="Search dashboard"
          />
        </div>
      )}

      <div className="nav-right-actions">
        <button 
          className="nav-icon-btn" 
          onClick={toggleTheme} 
          aria-label="Toggle light and dark theme"
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
        >
          {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
        </button>

        {!user ? (
          <div className="public-nav-links">
            <Link to="/about">About</Link>
            <Link to="/login">Login</Link>
            <Link to="/register" className="primary-button" style={{ padding: "8px 18px", fontSize: "13px" }}>
              Get Started
            </Link>
          </div>
        ) : (
          <>
            <button className="nav-icon-btn" aria-label="Notifications" title="Notifications">
              <Bell size={19} />
              <span className="notification-dot"></span>
            </button>

            <div className="user-profile-badge">
              <div className="avatar-circle">
                {getInitials(userData?.name, user?.email)}
              </div>
              <div className="user-info-meta">
                <span className="user-name">{userData?.name || user?.email?.split('@')[0] || "User"}</span>
                <span className="user-role-tag">{userData?.role || "Patient"}</span>
              </div>
            </div>

            <button className="logout-button" onClick={handleLogout} title="Log out">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}