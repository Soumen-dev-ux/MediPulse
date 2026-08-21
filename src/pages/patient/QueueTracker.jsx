import { useState, useEffect } from "react";
import { 
  MapPin, 
  UserCheck, 
  RefreshCw, 
  XCircle, 
  PhoneCall,
  Bell,
  Radio,
  CheckCircle,
  Clock,
  Sparkles,
  Volume2
} from "lucide-react";
import { subscribeToFacility, generateQueueToken } from "../../firebase/facilities";
import { socket } from "../../socket";

export default function QueueTracker() {
  const [facility, setFacility] = useState(null);
  const [liveCurrentToken, setLiveCurrentToken] = useState(null);
  const [liveDoctorStatus, setLiveDoctorStatus] = useState("present");
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);
  const [tokenCallNotice, setTokenCallNotice] = useState(null);

  const [userTokenNumber, setUserTokenNumber] = useState(() => {
    const saved = localStorage.getItem("medipulse_user_token");
    return saved ? parseInt(saved, 10) : 14;
  });
  const [isCancelled, setIsCancelled] = useState(() => {
    return localStorage.getItem("medipulse_token_cancelled") === "true";
  });

  const facilityId = "city-central-hospital";

  useEffect(() => {
    let isMounted = true;

    // Join Socket Facility Room
    socket.emit("join-facility", facilityId);

    const onConnect = () => {
      if (isMounted) setIsSocketConnected(true);
    };
    const onDisconnect = () => {
      if (isMounted) setIsSocketConnected(false);
    };

    // Socket Event: Token Called by Doctor
    const onTokenCalled = (data) => {
      console.log("📢 Real-time Token Event Received:", data);
      if (!isMounted) return;

      if (data.tokenNumber) {
        setLiveCurrentToken(data.tokenNumber);
      }

      setTokenCallNotice({
        token: data.token,
        tokenNumber: data.tokenNumber,
        patientName: data.patientName,
        room: data.room || "Room 302",
        doctorName: data.doctorName || "Dr. Sharma",
        isUser: data.tokenNumber === userTokenNumber || data.token === `#A-${userTokenNumber}`
      });

      // Play audio chime beep simulation if available
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch {
        // Audio fallback
      }
    };

    // Socket Event: Doctor Availability Updated
    const onDoctorStatus = (data) => {
      console.log("👨‍⚕️ Real-time Doctor Status:", data);
      if (isMounted && data.status) {
        setLiveDoctorStatus(data.status);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("token-called", onTokenCalled);
    socket.on("doctor-status-updated", onDoctorStatus);

    const unsubscribe = subscribeToFacility((data) => {
      if (isMounted) setFacility(data);
    });

    return () => {
      isMounted = false;
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("token-called", onTokenCalled);
      socket.off("doctor-status-updated", onDoctorStatus);
      unsubscribe();
    };
  }, [userTokenNumber]);

  const currentToken = liveCurrentToken ?? facility?.currentToken ?? 12;
  const isDoctorPresent = liveDoctorStatus === "present";
  const tokensAhead = Math.max(0, userTokenNumber - currentToken);
  const estimatedWaitMins = tokensAhead * 10;
  const isMyTurn = currentToken >= userTokenNumber;

  const handleGetNewToken = async () => {
    try {
      const newToken = await generateQueueToken();
      setUserTokenNumber(newToken);
      setIsCancelled(false);
      localStorage.setItem("medipulse_user_token", newToken.toString());
      localStorage.setItem("medipulse_token_cancelled", "false");
    } catch {
      const fallbackToken = (userTokenNumber || 14) + 1;
      setUserTokenNumber(fallbackToken);
      setIsCancelled(false);
      localStorage.setItem("medipulse_user_token", fallbackToken.toString());
      localStorage.setItem("medipulse_token_cancelled", "false");
    }
  };

  const handleCancelToken = () => {
    if (window.confirm(`Are you sure you want to cancel your active queue token #A-${userTokenNumber}?`)) {
      setIsCancelled(true);
      localStorage.setItem("medipulse_token_cancelled", "true");
    }
  };

  return (
    <div className="dashboard fade-in">
      {/* Live Called Token Broadcast Modal Banner */}
      {tokenCallNotice && (
        <div className="modal-overlay" onClick={() => setTokenCallNotice(null)}>
          <div 
            className="modal-card fade-in" 
            onClick={(e) => e.stopPropagation()} 
            style={{
              background: tokenCallNotice.isUser 
                ? "linear-gradient(135deg, #064e3b 0%, #022c22 100%)" 
                : "var(--color-bg-surface)",
              borderRadius: "24px",
              padding: "32px",
              maxWidth: "480px",
              border: tokenCallNotice.isUser ? "2px solid #10b981" : "1px solid var(--color-border)",
              boxShadow: tokenCallNotice.isUser ? "0 0 50px rgba(16, 185, 129, 0.4)" : "var(--color-shadow-lg)",
              textAlign: "center"
            }}
          >
            <div style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              background: tokenCallNotice.isUser ? "rgba(16, 185, 129, 0.25)" : "var(--color-primary-glow)",
              color: tokenCallNotice.isUser ? "#65e6b3" : "var(--color-primary-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              <Volume2 size={36} className="pulse-icon" />
            </div>

            <span className="eyebrow" style={{ color: tokenCallNotice.isUser ? "#65e6b3" : "var(--color-primary-light)" }}>
              {tokenCallNotice.isUser ? "🔔 YOUR TOKEN IS CALLED NOW!" : "📢 QUEUE BROADCAST ALERT"}
            </span>

            <h2 style={{ fontSize: "28px", fontWeight: "800", marginTop: "4px" }}>
              Token {tokenCallNotice.token || `#A-${tokenCallNotice.tokenNumber}`}
            </h2>

            <p style={{ fontSize: "15px", margin: "12px 0 20px", color: tokenCallNotice.isUser ? "#e2e8f0" : "var(--color-text-secondary)" }}>
              {tokenCallNotice.isUser ? (
                <>Please proceed immediately to <strong>{tokenCallNotice.room}</strong> with <strong>{tokenCallNotice.doctorName}</strong>.</>
              ) : (
                <>Patient <strong>{tokenCallNotice.patientName}</strong> is called to <strong>{tokenCallNotice.room}</strong>.</>
              )}
            </p>

            <button 
              className="primary-button full" 
              onClick={() => setTokenCallNotice(null)}
              style={{
                background: tokenCallNotice.isUser ? "#10b981" : undefined,
                color: tokenCallNotice.isUser ? "#022c22" : undefined
              }}
            >
              Acknowledge Alert
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <p className="eyebrow" style={{ margin: 0 }}>PATIENT PORTAL · REAL-TIME QUEUE STREAM</p>
            <span className="status-badge confirmed" style={{ padding: "3px 10px", fontSize: "11px" }}>
              <Radio size={12} style={{ color: isSocketConnected ? "#10b981" : "#f59e0b" }} />
              {isSocketConnected ? "Socket IO Synced" : "Connecting..."}
            </span>
          </div>
          <h1 style={{ marginTop: "6px" }}>My Live Queue Tracker</h1>
          <p className="dashboard-subtitle">Real-time live token counters, instant broadcast calls, and estimated arrival times.</p>
        </div>
        <div>
          <button className="primary-button" onClick={handleGetNewToken}>
            <RefreshCw size={16} /> Issue New Token
          </button>
        </div>
      </div>

      {/* Main Tracker Card Panel */}
      {isCancelled ? (
        <div className="card-panel">
          <div className="panel-title-bar">
            <h2>Queue Reservation Status</h2>
            <span className="status-badge away">
              <XCircle size={14} /> Token Cancelled
            </span>
          </div>

          <div style={{ background: "var(--color-bg-elevated)", borderRadius: "20px", padding: "48px 24px", textAlign: "center", border: "1px solid var(--color-border)" }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              <XCircle size={36} />
            </div>

            <h3 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "8px" }}>
              Your Queue Token Has Been Cancelled
            </h3>

            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", maxWidth: "480px", margin: "0 auto 24px", lineHeight: "1.6" }}>
              Token <strong>#A-{userTokenNumber}</strong> is no longer active in the line. You will not be called for consultation until you request a new token.
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button className="primary-button" onClick={handleGetNewToken}>
                <RefreshCw size={16} /> Issue New Queue Token
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-panel">
          <div className="panel-title-bar">
            <h2>Active Queue Reservation</h2>
            <span className={`status-badge ${isMyTurn ? "confirmed" : "away"}`} style={{
              background: isMyTurn ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.15)",
              color: isMyTurn ? "var(--color-primary-light)" : "#60a5fa"
            }}>
              <span className="status-dot-pulse"></span>
              {isMyTurn ? "🔔 YOUR TURN! Proceed to Room 302" : `${tokensAhead} Patients Ahead of You`}
            </span>
          </div>

          <div className="facility-card" style={{ background: "var(--color-bg-elevated)", borderRadius: "20px", padding: "28px", border: "1px solid var(--color-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", marginBottom: "20px" }}>
              <div>
                <span className="facility-category" style={{ color: "var(--color-primary-light)", fontWeight: "700" }}>CARDIOLOGY DEPARTMENT · MAIN CAMPUS</span>
                <h2 style={{ fontSize: "24px", fontWeight: "800", marginTop: "4px" }}>City Central Hospital</h2>
                <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <MapPin size={16} style={{ color: "var(--color-primary-light)" }} /> Room 302, Floor 3, Block B
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: "800", letterSpacing: "1px" }}>DOCTOR IN CHARGE</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <UserCheck size={18} style={{ color: "var(--color-primary-light)" }} />
                  <strong style={{ fontSize: "16px" }}>Dr. Sharma (Cardiologist)</strong>
                </div>
                <p style={{ fontSize: "13px", fontWeight: "600", color: isDoctorPresent ? "var(--color-primary-light)" : "var(--color-warning)", marginTop: "4px" }}>
                  {isDoctorPresent ? "🟢 Doctor Present & Consulting" : "🟡 Doctor Currently Away"}
                </p>
              </div>
            </div>

            {/* Token Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", margin: "24px 0" }}>
              <div className="queue-display-box" style={{ 
                background: "var(--color-bg-surface)", 
                padding: "24px", 
                borderRadius: "16px",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-sm)"
              }}>
                <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "1px", color: "var(--color-text-muted)" }}>YOUR RESERVED TOKEN</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                  <strong style={{ fontSize: "38px", color: "var(--color-primary-light)", fontWeight: "800" }}>#A-{userTokenNumber}</strong>
                </div>
              </div>

              <div className="queue-display-box" style={{ 
                background: "var(--color-bg-surface)", 
                padding: "24px", 
                borderRadius: "16px",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-sm)"
              }}>
                <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "1px", color: "var(--color-text-muted)" }}>CURRENTLY SERVING</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                  <strong style={{ fontSize: "38px", color: "#60a5fa", fontWeight: "800" }}>#A-{currentToken}</strong>
                </div>
              </div>

              <div className="queue-display-box" style={{ 
                background: "var(--color-bg-surface)", 
                padding: "24px", 
                borderRadius: "16px",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-sm)"
              }}>
                <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "1px", color: "var(--color-text-muted)" }}>ESTIMATED WAIT</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                  <strong style={{ fontSize: "38px", color: isMyTurn ? "var(--color-primary-light)" : "var(--color-warning)", fontWeight: "800" }}>
                    {isMyTurn ? "0 mins" : `${estimatedWaitMins} mins`}
                  </strong>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", fontWeight: "600" }}>
                <span>Live Queue Progress</span>
                <span>{isMyTurn ? "100% Ready" : `Position ${userTokenNumber - currentToken} of ${userTokenNumber}`}</span>
              </div>
              <div style={{ width: "100%", height: "12px", background: "var(--color-bg-surface)", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--color-border)" }}>
                <div 
                  style={{ 
                    height: "100%", 
                    width: `${Math.min(100, Math.max(12, (currentToken / userTokenNumber) * 100))}%`, 
                    background: "linear-gradient(90deg, #3b82f6, #10b981)",
                    borderRadius: "8px",
                    transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
                  }} 
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "14px", marginTop: "28px", flexWrap: "wrap" }}>
              <button 
                className="primary-button"
                style={{ flex: 1, minWidth: "160px" }}
                onClick={() => alert(`Showing map directions to City Central Hospital Room 302`)}
              >
                <MapPin size={16} /> Navigate to Room 302
              </button>
              <button 
                className="secondary-button"
                style={{ flex: 1, minWidth: "140px" }}
                onClick={() => alert("Contacting clinic desk at +91 98765 43210...")}
              >
                <PhoneCall size={16} /> Contact Desk
              </button>
              <button 
                className="danger-button"
                onClick={handleCancelToken}
                style={{ flex: 1, minWidth: "140px" }}
              >
                <XCircle size={16} /> Cancel Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
