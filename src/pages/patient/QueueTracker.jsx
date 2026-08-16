import { useState, useEffect } from "react";
import { 
  Clock, 
  MapPin, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  XCircle, 
  PhoneCall 
} from "lucide-react";
import { subscribeToFacility, generateQueueToken } from "../../firebase/facilities";

export default function QueueTracker() {
  const [facility, setFacility] = useState(null);
  const [userTokenNumber, setUserTokenNumber] = useState(15);
  const [loading, setLoading] = useState(true);

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

  const currentToken = facility?.currentToken ?? 12;
  const isDoctorPresent = facility?.isDoctorPresent ?? true;
  const tokensAhead = Math.max(0, userTokenNumber - currentToken);
  const estimatedWaitMins = tokensAhead * 10;
  const isMyTurn = currentToken >= userTokenNumber;

  const handleGetNewToken = async () => {
    try {
      const newToken = await generateQueueToken();
      setUserTokenNumber(newToken);
      alert(`Issued New Live Queue Token #A-${newToken}!`);
    } catch (e) {
      setUserTokenNumber(prev => prev + 1);
      alert(`Token #A-${userTokenNumber + 1} generated!`);
    }
  };

  const handleCancelToken = () => {
    if (window.confirm("Are you sure you want to cancel your active queue token #A-" + userTokenNumber + "?")) {
      alert("Your token has been cancelled. You can generate a new token anytime.");
    }
  };

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">PATIENT PORTAL · REAL-TIME QUEUE ENGINE</p>
          <h1>My Live Queue Tracker</h1>
          <p className="dashboard-subtitle">Monitor live serving token counters, estimated arrival times, and clinic alerts.</p>
        </div>
        <div>
          <button className="primary-button" onClick={handleGetNewToken}>
            <RefreshCw size={16} /> Issue New Token
          </button>
        </div>
      </div>

      {/* Main Tracker Card */}
      <div className="card-panel" style={{ marginBottom: "24px" }}>
        <div className="panel-title-bar">
          <h2>Active Queue Reservation</h2>
          <span className={`status-badge ${isMyTurn ? "confirmed" : "away"}`}>
            <span className="status-dot-pulse"></span>
            {isMyTurn ? "Your Turn! Proceed to Consult Room" : `${tokensAhead} Patients Ahead of You`}
          </span>
        </div>

        <div className="facility-card" style={{ background: "var(--color-bg-secondary)", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", marginBottom: "20px" }}>
            <div>
              <span className="facility-category">CARDIOLOGY DEPARTMENT · MAIN CAMPUS</span>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginTop: "4px" }}>City Central Hospital</h2>
              <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin size={16} /> Room 302, Floor 3, Block B
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: "600" }}>DOCTOR IN CHARGE</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <UserCheck size={18} style={{ color: "var(--color-primary-light)" }} />
                <strong style={{ fontSize: "16px" }}>Dr. Sharma (Cardiologist)</strong>
              </div>
              <p style={{ fontSize: "12px", color: isDoctorPresent ? "var(--color-primary-light)" : "var(--color-warning)", marginTop: "2px" }}>
                {isDoctorPresent ? "● Doctor Present & Seeing Patients" : "▲ Doctor Currently Away on Emergency"}
              </p>
            </div>
          </div>

          {/* Token Display Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", margin: "24px 0" }}>
            <div className="queue-display-box" style={{ background: "var(--color-bg-tertiary)", padding: "20px", borderRadius: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.5px" }}>YOUR RESERVED TOKEN</span>
              <strong style={{ fontSize: "36px", color: "var(--color-primary-light)" }}>#A-{userTokenNumber}</strong>
            </div>

            <div className="queue-display-box" style={{ background: "var(--color-bg-tertiary)", padding: "20px", borderRadius: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.5px" }}>CURRENTLY SERVING TOKEN</span>
              <strong style={{ fontSize: "36px", color: "#60a5fa" }}>#A-{currentToken}</strong>
            </div>

            <div className="queue-display-box" style={{ background: "var(--color-bg-tertiary)", padding: "20px", borderRadius: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.5px" }}>ESTIMATED WAIT TIME</span>
              <strong style={{ fontSize: "36px", color: isMyTurn ? "var(--color-primary-light)" : "var(--color-warning)" }}>
                {isMyTurn ? "0 mins" : `${estimatedWaitMins} mins`}
              </strong>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", fontWeight: "600" }}>
              <span>Queue Position Progress</span>
              <span>{isMyTurn ? "100% Complete" : `Position ${userTokenNumber - currentToken} of ${userTokenNumber}`}</span>
            </div>
            <div style={{ width: "100%", height: "10px", background: "var(--color-bg-tertiary)", borderRadius: "6px", overflow: "hidden" }}>
              <div 
                style={{ 
                  height: "100%", 
                  width: `${Math.min(100, Math.max(10, (currentToken / userTokenNumber) * 100))}%`, 
                  background: "linear-gradient(90deg, #3b82f6, #10b981)",
                  borderRadius: "6px",
                  transition: "width 0.5s ease"
                }} 
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
            <button 
              className="primary-button"
              onClick={() => alert(`Showing map navigation to City Central Hospital Room 302...`)}
            >
              <MapPin size={16} /> Navigate to Room 302
            </button>
            <button 
              className="secondary-button"
              onClick={() => alert("Contacting clinic reception desk at +91 98765 43210...")}
            >
              <PhoneCall size={16} /> Contact Desk
            </button>
            <button 
              className="danger-button"
              onClick={handleCancelToken}
              style={{ marginLeft: "auto" }}
            >
              <XCircle size={16} /> Cancel Token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
