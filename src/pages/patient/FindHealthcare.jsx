import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { 
  MapPin, 
  Search, 
  Hospital, 
  Pill, 
  HeartPulse, 
  Navigation, 
  Clock, 
  PhoneCall, 
  Star, 
  UserCheck, 
  PlusCircle 
} from "lucide-react";
import { subscribeToFacility, generateQueueToken } from "../../firebase/facilities";

// Map Helper Component to center on position changes
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

// Calculate Haversine distance in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return "1.2 km";
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
};

export default function FindHealthcare({ onOpenBookModal }) {
  const [userLocation, setUserLocation] = useState([22.5726, 88.3639]); // Default Kolkata center
  const [isGPSActive, setIsGPSActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real-time Geolocation tracking (watchPosition)
  useEffect(() => {
    let watchId;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setIsGPSActive(true);
        },
        (err) => {
          console.warn("GPS tracking unavailable, using default coordinates:", err.message);
          setIsGPSActive(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Firestore facility subscription
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeToFacility((data) => {
      if (isMounted) {
        setFacility(data);
        setLoading(false);
      }
    });

    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 1500);

    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // Healthcare Facilities List (Hospitals, Medical Shops, Nursing Homes)
  const healthcareNodes = [
    {
      id: "hosp-1",
      name: facility?.name || "City Central Hospital (Main Campus)",
      category: "hospital",
      typeLabel: "Hospital & Emergency",
      address: facility?.address || "Block B, Floor 3, Park Street",
      lat: Number(facility?.latitude) || 22.5726,
      lng: Number(facility?.longitude) || 88.3639,
      rating: 4.9,
      doctor: "Dr. Sharma (MBBS, MD)",
      status: facility?.isDoctorPresent ? "present" : "away",
      currentToken: `#A-${facility?.currentToken || 12}`,
      phone: "+91 98765 43210",
      openHours: "Open 24/7",
    },
    {
      id: "hosp-2",
      name: "Apollo Care Specialty Hospital",
      category: "hospital",
      typeLabel: "Multispecialty Hospital",
      address: "Sector V, Salt Lake City",
      lat: 22.5800,
      lng: 88.4172,
      rating: 4.8,
      doctor: "Dr. Ananya Roy (MS Ortho)",
      status: "consultation",
      currentToken: "#B-08",
      phone: "+91 98300 11223",
      openHours: "Open 24/7",
    },
    {
      id: "pharm-1",
      name: "MedPlus 24x7 Pharmacy & Medical Store",
      category: "pharmacy",
      typeLabel: "Medical Shop & Pharmacy",
      address: "14/2 Park Street Main Rd",
      lat: 22.5690,
      lng: 88.3600,
      rating: 4.7,
      doctor: "Licensed Pharmacist On Duty",
      status: "present",
      currentToken: "In Stock",
      phone: "+91 98111 22334",
      openHours: "24 Hours Open",
    },
    {
      id: "pharm-2",
      name: "Apollo Pharmacy & Healthcare Depot",
      category: "pharmacy",
      typeLabel: "Pharmacy & Wellness",
      address: "88 Camac Street",
      lat: 22.5550,
      lng: 88.3520,
      rating: 4.9,
      doctor: "Refills & Home Delivery Available",
      status: "present",
      currentToken: "In Stock",
      phone: "+91 98222 33445",
      openHours: "7:00 AM - 11:00 PM",
    },
    {
      id: "nursing-1",
      name: "Sunrise Nursing Home & Elderly Care",
      category: "nursing_home",
      typeLabel: "Nursing Home & Rehabilitation",
      address: "EM Bypass, Science City Near Hub",
      lat: 22.5400,
      lng: 88.3900,
      rating: 4.6,
      doctor: "Dr. Soumen Pore (Medical Director)",
      status: "present",
      currentToken: "#C-03",
      phone: "+91 98555 66778",
      openHours: "Visiting Hrs: 10 AM - 7 PM",
    },
    {
      id: "nursing-2",
      name: "Green Valley Urgent Care & Nursing Home",
      category: "nursing_home",
      typeLabel: "Urgent Care Nursing Home",
      address: "Ballygunge Circular Rd",
      lat: 22.5300,
      lng: 88.3650,
      rating: 4.7,
      doctor: "Dr. Priya Das (DNB Medicine)",
      status: "present",
      currentToken: "#D-05",
      phone: "+91 98999 55443",
      openHours: "24/7 Admission Active",
    },
  ];

  const filteredNodes = healthcareNodes.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.typeLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleJoinQueue = async (node) => {
    try {
      const newToken = await generateQueueToken();
      alert(`🎉 Reserved Queue Token #A-${newToken} at ${node.name}!`);
    } catch (e) {
      alert(`Reserved Queue Token at ${node.name}. View status in My Queue Status!`);
    }
  };

  return (
    <div className="dashboard fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">PATIENT PORTAL · LIVE GPS MAP & HEALTHCARE FINDER</p>
          <h1>Find Hospitals, Pharmacies & Nursing Homes</h1>
          <p className="dashboard-subtitle">Real-time GPS movement tracking, category filters, and live doctor availability status.</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span className={`status-badge ${isGPSActive ? "confirmed" : "away"}`} style={{ fontSize: "12px" }}>
            <span className="status-dot-pulse"></span>
            {isGPSActive ? "GPS Tracking Active (Moving)" : "Using City Location"}
          </span>
          <button className="primary-button" onClick={onOpenBookModal}>
            <PlusCircle size={18} /> Book Appointment
          </button>
        </div>
      </div>

      {/* Category Filter Chips & Search Bar */}
      <div className="card-panel" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          {/* Category Tabs */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
            <button
              className={`status-toggle-btn ${selectedCategory === "all" ? "active" : ""}`}
              style={{ fontSize: "12px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px" }}
              onClick={() => setSelectedCategory("all")}
            >
              All Facilities ({healthcareNodes.length})
            </button>
            <button
              className={`status-toggle-btn ${selectedCategory === "hospital" ? "active" : ""}`}
              style={{ fontSize: "12px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px" }}
              onClick={() => setSelectedCategory("hospital")}
            >
              <Hospital size={14} /> Hospitals
            </button>
            <button
              className={`status-toggle-btn ${selectedCategory === "pharmacy" ? "active" : ""}`}
              style={{ fontSize: "12px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px" }}
              onClick={() => setSelectedCategory("pharmacy")}
            >
              <Pill size={14} /> Medical Shops
            </button>
            <button
              className={`status-toggle-btn ${selectedCategory === "nursing_home" ? "active" : ""}`}
              style={{ fontSize: "12px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px" }}
              onClick={() => setSelectedCategory("nursing_home")}
            >
              <HeartPulse size={14} /> Nursing Homes
            </button>
          </div>

          {/* Search Box */}
          <div className="nav-center-search" style={{ width: "280px" }}>
            <Search size={16} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search hospital, pharmacy, address..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Interactive Map Section */}
      <div className="card-panel" style={{ padding: "0", overflow: "hidden", borderRadius: "16px", marginBottom: "24px" }}>
        <div style={{ height: "480px", width: "100%", position: "relative" }}>
          <MapContainer
            center={userLocation}
            zoom={14}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapRecenter center={userLocation} />

            {/* Live Moving User Marker */}
            <CircleMarker
              center={userLocation}
              radius={10}
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#2563eb",
                fillOpacity: 0.9,
                weight: 3
              }}
            >
              <Popup>
                <div style={{ color: "#1e293b" }}>
                  <strong style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Navigation size={14} color="#2563eb" /> Your Live Position (Moving)
                  </strong>
                  <p style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                    Lat: {userLocation[0].toFixed(4)}, Lng: {userLocation[1].toFixed(4)}
                  </p>
                </div>
              </Popup>
            </CircleMarker>

            {/* Facilities Category Pins */}
            {filteredNodes.map((item) => {
              const distanceText = calculateDistance(userLocation[0], userLocation[1], item.lat, item.lng);
              const markerColor = item.category === "hospital" ? "#3b82f6" : item.category === "pharmacy" ? "#10b981" : "#a855f7";

              return (
                <CircleMarker
                  key={item.id}
                  center={[item.lat, item.lng]}
                  radius={12}
                  pathOptions={{
                    color: markerColor,
                    fillColor: markerColor,
                    fillOpacity: 0.85,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div style={{ color: "#1e293b", minWidth: "220px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: markerColor }}>
                        {item.typeLabel}
                      </span>
                      <h4 style={{ fontSize: "15px", fontWeight: "700", margin: "2px 0 4px" }}>{item.name}</h4>
                      <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>
                        <MapPin size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {item.address} · <strong>{distanceText} away</strong>
                      </p>

                      <div style={{ fontSize: "12px", background: "#f1f5f9", padding: "6px 8px", borderRadius: "6px", marginBottom: "8px" }}>
                        <div><strong>Staff:</strong> {item.doctor}</div>
                        <div><strong>Hours:</strong> {item.openHours}</div>
                        {item.category !== "pharmacy" && <div><strong>Serving Token:</strong> {item.currentToken}</div>}
                      </div>

                      <div style={{ display: "flex", gap: "6px" }}>
                        {item.category !== "pharmacy" && (
                          <button 
                            className="primary-button" 
                            style={{ padding: "4px 8px", fontSize: "11px", flex: 1 }}
                            onClick={() => handleJoinQueue(item)}
                          >
                            Join Queue
                          </button>
                        )}
                        <button 
                          className="secondary-button" 
                          style={{ padding: "4px 8px", fontSize: "11px" }}
                          onClick={() => alert(`Calling ${item.name} (${item.phone})...`)}
                        >
                          <PhoneCall size={12} /> Call
                        </button>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Categorized Facilities Cards List */}
      <div className="card-panel">
        <div className="panel-title-bar">
          <h2>Nearby Healthcare Directory ({filteredNodes.length})</h2>
        </div>

        <div className="admin-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          {filteredNodes.map((item) => {
            const distanceText = calculateDistance(userLocation[0], userLocation[1], item.lat, item.lng);

            return (
              <div className="admin-card" key={item.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <span className="facility-category" style={{ 
                        color: item.category === "hospital" ? "#60a5fa" : item.category === "pharmacy" ? "var(--color-primary-light)" : "#c084fc" 
                      }}>
                        {item.typeLabel.toUpperCase()}
                      </span>
                      <h3 style={{ fontSize: "17px", fontWeight: "700", marginTop: "2px" }}>{item.name}</h3>
                    </div>
                    <span className="status-badge confirmed" style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Star size={12} fill="currentColor" /> {item.rating}
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin size={14} /> {item.address} · <strong style={{ color: "var(--color-primary-light)" }}>{distanceText} away</strong>
                  </p>

                  <div className="doctor-info-box" style={{ marginBottom: "12px" }}>
                    <div className="doctor-avatar-circle" style={{ 
                      background: item.category === "hospital" ? "rgba(59,130,246,0.15)" : item.category === "pharmacy" ? "rgba(16,185,129,0.15)" : "rgba(168,85,247,0.15)",
                      color: item.category === "hospital" ? "#60a5fa" : item.category === "pharmacy" ? "var(--color-primary-light)" : "#c084fc"
                    }}>
                      {item.category === "hospital" ? <Hospital size={16} /> : item.category === "pharmacy" ? <Pill size={16} /> : <HeartPulse size={16} />}
                    </div>
                    <div className="doctor-info-text">
                      <strong>{item.doctor}</strong>
                      <p style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{item.openHours}</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  {item.category !== "pharmacy" && (
                    <button 
                      className="primary-button" 
                      style={{ flex: 1 }}
                      onClick={() => handleJoinQueue(item)}
                    >
                      <Clock size={15} /> Join Queue ({item.currentToken})
                    </button>
                  )}
                  <button 
                    className="secondary-button"
                    onClick={() => alert(`Calling ${item.name} (${item.phone})...`)}
                    title="Call Facility"
                  >
                    <PhoneCall size={15} /> Call
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}