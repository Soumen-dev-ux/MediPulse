import { useState } from "react";
import { X, PhoneCall, AlertTriangle, MapPin, CheckCircle2 } from "lucide-react";

export default function EmergencyModal({ isOpen, onClose }) {
  const [dispatchStatus, setDispatchStatus] = useState("idle"); // 'idle' | 'calling' | 'dispatched'

  if (!isOpen) return null;

  const handleCallEmergency = () => {
    setDispatchStatus("calling");
    setTimeout(() => {
      setDispatchStatus("dispatched");
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card fade-in" onClick={(e) => e.stopPropagation()} style={{
        background: "var(--color-bg-surface)", borderRadius: "16px", padding: "28px",
        maxWidth: "480px", border: "1px solid rgba(239,68,68,0.4)", boxShadow: "0 20px 50px rgba(239,68,68,0.2)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="stat-icon-wrapper" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#fca5a5", padding: "8px" }}>
              <AlertTriangle size={24} />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#fca5a5" }}>Emergency SOS Dispatch</h2>
          </div>
          <button onClick={onClose} className="nav-icon-btn">
            <X size={20} />
          </button>
        </div>

        {dispatchStatus === "idle" && (
          <div>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
              Connecting to 24/7 Central Healthcare Dispatch Center (Helpline 108). Your live GPS location will be transmitted automatically.
            </p>

            <div style={{ background: "var(--color-bg-elevated)", padding: "14px", borderRadius: "10px", marginBottom: "20px" }}>
              <span style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: "600" }}>DETECTED EMERGENCY LOCATION</span>
              <p style={{ fontSize: "14px", fontWeight: "700", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin size={16} style={{ color: "var(--color-danger)" }} /> Park Street, Sector V, City Central Zone
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button className="secondary-button" onClick={onClose} style={{ flex: 1, minWidth: "120px" }}>
                Cancel
              </button>
              <button className="danger-button" onClick={handleCallEmergency} style={{ flex: 1, minWidth: "200px", padding: "12px" }}>
                <PhoneCall size={18} /> CALL 108 AMBULANCE NOW
              </button>
            </div>
          </div>
        )}

        {dispatchStatus === "calling" && (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <div className="status-dot-pulse" style={{ background: "var(--color-danger)", width: "20px", height: "20px", margin: "0 auto 16px" }}></div>
            <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Connecting Emergency Hotline 108...</h3>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "6px" }}>Transmitting GPS coordinates to nearest dispatch center...</p>
          </div>
        )}

        {dispatchStatus === "dispatched" && (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--color-primary-light)", width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "800" }}>Ambulance Unit Dispatched!</h3>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginTop: "6px" }}>
              Unit #AMB-402 is en route from City Central Hospital. Estimated arrival time: <strong>7 minutes</strong>.
            </p>
            <button className="primary-button full" onClick={onClose} style={{ marginTop: "20px" }}>
              Close & Keep Hotline Connected
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
