import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Activity,
  MapPin,
  Clock,
  Bot,
  Hospital,
  PhoneCall,
  Navigation,
  Search,
  ArrowLeft,
  ArrowRight,
  Layers,
  Radar,
  Radio,
  Star,
  CheckCircle2,
  Users
} from "lucide-react";

// Map Helper Component to dynamically recenter Leaflet map view
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 13, { animate: true });
    }
  }, [center, map]);
  return null;
};

export default function About() {
  const [selectedHospital, setSelectedHospital] = useState(0);
  const [viewMode, setViewMode] = useState("map"); // 'map' | 'radar'
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const hospitalsData = [
    {
      id: 0,
      name: "City Central Multi-Specialty Hospital",
      category: "hospital",
      categoryLabel: "Multi-Specialty & Cardiology",
      location: "Park Street Campus · Block B, Kolkata",
      lat: 22.5726,
      lng: 88.3639,
      status: "Operational",
      doctorsPresent: 14,
      queueServing: "#A-14",
      avgWait: "14 mins",
      phone: "+91 98765 43210",
      rating: 4.9,
      openHours: "Open 24/7",
      coords: { top: "28%", left: "32%" }
    },
    {
      id: 1,
      name: "Metro Cardiac & Intensive Center",
      category: "cardiac",
      categoryLabel: "Cardiology & Intensive Care",
      location: "South Wing · Sector V, Salt Lake",
      lat: 22.5800,
      lng: 88.4172,
      status: "Operational",
      doctorsPresent: 8,
      queueServing: "#C-08",
      avgWait: "10 mins",
      phone: "+91 98300 11223",
      rating: 4.8,
      openHours: "Open 24/7",
      coords: { top: "60%", left: "68%" }
    },
    {
      id: 2,
      name: "Apex Emergency & Trauma Care",
      category: "trauma",
      categoryLabel: "24/7 Trauma & Emergency Hub",
      location: "EM Bypass Avenue · Entrance 1",
      lat: 22.5400,
      lng: 88.3900,
      status: "High Capacity",
      doctorsPresent: 22,
      queueServing: "#E-42",
      avgWait: "5 mins",
      phone: "+91 98111 99887",
      rating: 4.9,
      openHours: "Open 24/7",
      coords: { top: "38%", left: "76%" }
    },
    {
      id: 3,
      name: "Sunrise Community Health Clinic",
      category: "clinic",
      categoryLabel: "General Medicine & Pediatrics",
      location: "West District · Camac Street",
      lat: 22.5550,
      lng: 88.3520,
      status: "Operational",
      doctorsPresent: 6,
      queueServing: "#G-05",
      avgWait: "8 mins",
      phone: "+91 98555 44332",
      rating: 4.7,
      openHours: "8:00 AM - 10:00 PM",
      coords: { top: "72%", left: "24%" }
    }
  ];

  const filteredHospitals = hospitalsData.filter((h) => {
    const matchesCategory =
      selectedCategory === "all" || h.category === selectedCategory;
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentHospital = hospitalsData[selectedHospital] || hospitalsData[0];
  const mapCenter = [currentHospital.lat, currentHospital.lng];

  const handleGetDirections = (hospital) => {
    const query = encodeURIComponent(`${hospital.name}, ${hospital.location}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

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

      {/* Interactive Connected Facility Network Map Section */}
      <div className="map-visual-container">
        <div className="map-header">
          <div>
            <span className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Radio size={14} className="pulse-icon" /> REAL-TIME HEALTHCARE NETWORK
            </span>
            <h2 style={{ fontSize: "22px", fontWeight: "800", marginTop: "2px" }}>Live Connected Facility Map</h2>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {/* View Mode Toggle Buttons */}
            <div className="map-view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === "map" ? "active" : ""}`}
                onClick={() => setViewMode("map")}
              >
                <Layers size={14} /> Interactive Map
              </button>
              <button
                className={`view-toggle-btn ${viewMode === "radar" ? "active" : ""}`}
                onClick={() => setViewMode("radar")}
              >
                <Radar size={14} /> Radar Grid View
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar & Search Box */}
        <div className="map-filter-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Facility Selection Chips */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              className={`status-toggle-btn ${selectedCategory === "all" ? "active" : ""}`}
              style={{ fontSize: "12px", padding: "6px 12px" }}
              onClick={() => setSelectedCategory("all")}
            >
              All Facilities ({hospitalsData.length})
            </button>
            <button
              className={`status-toggle-btn ${selectedCategory === "hospital" ? "active" : ""}`}
              style={{ fontSize: "12px", padding: "6px 12px" }}
              onClick={() => setSelectedCategory("hospital")}
            >
              Multi-Specialty
            </button>
            <button
              className={`status-toggle-btn ${selectedCategory === "cardiac" ? "active" : ""}`}
              style={{ fontSize: "12px", padding: "6px 12px" }}
              onClick={() => setSelectedCategory("cardiac")}
            >
              Cardiac Care
            </button>
            <button
              className={`status-toggle-btn ${selectedCategory === "trauma" ? "active" : ""}`}
              style={{ fontSize: "12px", padding: "6px 12px" }}
              onClick={() => setSelectedCategory("trauma")}
            >
              Trauma / 24x7
            </button>
            <button
              className={`status-toggle-btn ${selectedCategory === "clinic" ? "active" : ""}`}
              style={{ fontSize: "12px", padding: "6px 12px" }}
              onClick={() => setSelectedCategory("clinic")}
            >
              Clinics
            </button>
          </div>

          {/* Search Box */}
          <div className="nav-center-search" style={{ width: "240px" }}>
            <Search size={15} className="text-muted" />
            <input
              type="text"
              placeholder="Search network hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* View Viewport: Interactive Leaflet Map OR Radar Grid */}
        {viewMode === "map" ? (
          <div className="about-leaflet-viewport" style={{ height: "420px", width: "100%", borderRadius: "18px", overflow: "hidden", border: "1px solid var(--color-border)", position: "relative" }}>
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapRecenter center={mapCenter} />

              {filteredHospitals.map((h) => {
                const isSelected = selectedHospital === h.id;
                const markerColor =
                  h.category === "trauma"
                    ? "#ef4444"
                    : h.category === "cardiac"
                    ? "#a855f7"
                    : h.category === "clinic"
                    ? "#10b981"
                    : "#3b82f6";

                return (
                  <CircleMarker
                    key={h.name}
                    center={[h.lat, h.lng]}
                    radius={isSelected ? 14 : 10}
                    pathOptions={{
                      color: markerColor,
                      fillColor: markerColor,
                      fillOpacity: 0.9,
                      weight: isSelected ? 4 : 2
                    }}
                    eventHandlers={{
                      click: () => setSelectedHospital(h.id)
                    }}
                  >
                    <Popup>
                      <div style={{ minWidth: "220px", color: "#1e293b" }}>
                        <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: markerColor }}>
                          {h.categoryLabel}
                        </span>
                        <h4 style={{ fontSize: "15px", fontWeight: "700", margin: "2px 0 4px" }}>{h.name}</h4>
                        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
                          <MapPin size={12} style={{ display: "inline", marginRight: "4px" }} />
                          {h.location}
                        </p>
                        <div style={{ fontSize: "12px", background: "#f8fafc", padding: "6px 8px", borderRadius: "6px", marginBottom: "10px", border: "1px solid #e2e8f0" }}>
                          <div><strong>Doctors On Duty:</strong> {h.doctorsPresent} Active</div>
                          <div><strong>Queue Token Serving:</strong> {h.queueServing}</div>
                          <div><strong>Est Wait:</strong> {h.avgWait}</div>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            className="secondary-button"
                            style={{ padding: "4px 8px", fontSize: "11px", flex: 1 }}
                            onClick={() => handleGetDirections(h)}
                          >
                            <Navigation size={12} /> Directions
                          </button>
                          <a
                            href={`tel:${h.phone.replace(/\s/g, "")}`}
                            className="primary-button"
                            style={{ padding: "4px 8px", fontSize: "11px", textDecoration: "none", color: "#06151a" }}
                          >
                            <PhoneCall size={12} /> Call
                          </a>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        ) : (
          <div className="map-radar-viewport">
            <div className="radar-grid-bg" />
            <div className="radar-sweep" />

            {/* Interactive Hospital Pin Nodes */}
            {filteredHospitals.map((hospital) => {
              const isSelected = selectedHospital === hospital.id;
              return (
                <div
                  key={hospital.name}
                  className={`hospital-pin-node ${isSelected ? "selected" : ""}`}
                  style={{ top: hospital.coords.top, left: hospital.coords.left }}
                  onClick={() => setSelectedHospital(hospital.id)}
                >
                  <div className="status-dot-pulse" style={{ background: "var(--color-primary-light)" }} />
                  <Hospital size={16} style={{ color: "var(--color-primary-light)" }} />
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-text-primary)" }}>
                    {hospital.name.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Facility Selector Buttons below map */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {hospitalsData.map((h) => (
            <button
              key={h.name}
              className={`status-toggle-btn ${selectedHospital === h.id ? "active" : ""}`}
              style={{ fontSize: "12px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
              onClick={() => setSelectedHospital(h.id)}
            >
              <Hospital size={13} />
              {h.name}
            </button>
          ))}
        </div>

        {/* Selected Hospital Info Detail Panel */}
        <div className="doctor-info-box" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span className="facility-category" style={{ fontSize: "11px", fontWeight: "800", color: "var(--color-primary-light)" }}>
              {currentHospital.categoryLabel}
            </span>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginTop: "2px" }}>{currentHospital.name}</h3>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
              <MapPin size={14} />
              {currentHospital.location} · <strong>{currentHospital.openHours}</strong>
            </p>
          </div>

          <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
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
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="secondary-button"
                style={{ padding: "8px 14px", fontSize: "12px" }}
                onClick={() => handleGetDirections(currentHospital)}
              >
                <Navigation size={14} /> Directions
              </button>
              <Link
                to="/patient/healthcare"
                className="primary-button"
                style={{ padding: "8px 14px", fontSize: "12px", textDecoration: "none" }}
              >
                Find & Book
              </Link>
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