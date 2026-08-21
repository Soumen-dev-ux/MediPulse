import { useState, useEffect } from "react";
import { useAuth } from "../../Context/useAuth";
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Search, 
  PhoneCall, 
  FileText,
  ChevronRight,
  X,
  Radio,
  Sparkles,
  Volume2
} from "lucide-react";
import { updateDoctorPresence, serveNextPatient, subscribeToFacility } from "../../firebase/facilities";
import { createPrescription } from "../../firebase/prescriptions";
import { socket } from "../../socket";

const DoctorDashboard = () => {
  const { user, userData } = useAuth();
  const [statusMode, setStatusMode] = useState("present"); // 'present' | 'consultation' | 'away'
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [facility, setFacility] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);
  const [recentCallAlert, setRecentCallAlert] = useState(null);

  // EHR Record Modal State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [rxMedication, setRxMedication] = useState("");
  const [rxDosage, setRxDosage] = useState("");
  const [rxNotes, setRxNotes] = useState("");
  const [savingRx, setSavingRx] = useState(false);

  const facilityId = "city-central-hospital";
  const doctorName = userData?.name || user?.email?.split('@')[0] || "Doctor";

  useEffect(() => {
    let isMounted = true;

    // Join Socket facility room
    socket.emit("join-facility", facilityId);

    const onConnect = () => {
      if (isMounted) setIsSocketConnected(true);
    };
    const onDisconnect = () => {
      if (isMounted) setIsSocketConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    const unsubscribe = subscribeToFacility((data) => {
      if (isMounted) setFacility(data);
    });

    return () => {
      isMounted = false;
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      unsubscribe();
    };
  }, []);

  const handleStatusChange = async (mode) => {
    setStatusMode(mode);
    
    // Broadcast via Socket.IO
    socket.emit("doctor-status", {
      facilityId,
      status: mode,
      doctorName: `Dr. ${doctorName}`
    });

    try {
      await updateDoctorPresence(mode === "present", user?.uid || "doc-1", doctorName);
    } catch (error) {
      console.error("Failed to sync doctor availability:", error);
    }
  };

  const handleServeNext = async (patient) => {
    const currentTokenNum = facility?.currentToken ?? 12;
    const nextTokenNum = currentTokenNum + 1;
    const tokenStr = patient ? patient.token : `#A-${nextTokenNum}`;
    const patientName = patient ? patient.name : "Next Patient";

    // Broadcast live Socket event
    socket.emit("call-token", {
      facilityId,
      token: tokenStr,
      tokenNumber: nextTokenNum,
      patientName: patientName,
      room: "Room 302",
      doctorName: `Dr. ${doctorName}`,
      timestamp: new Date().toLocaleTimeString()
    });

    setRecentCallAlert({
      token: tokenStr,
      patientName: patientName,
      room: "Room 302"
    });

    setTimeout(() => {
      setRecentCallAlert(null);
    }, 4000);

    try {
      await serveNextPatient();
    } catch (err) {
      console.log("Serving token:", err);
    }
  };

  const handleSaveEHR = async (e) => {
    e.preventDefault();
    if (!rxMedication) return;
    setSavingRx(true);

    try {
      await createPrescription({
        medication: rxMedication,
        instructions: rxDosage || "Take as directed by doctor",
        remainingDays: "7 days remaining",
        doctorName: `Dr. ${doctorName}`,
        facility: "City Central Hospital",
        patientName: selectedPatient?.name || "Patient",
        notes: rxNotes,
      });

      setRecentCallAlert({
        title: "Prescription Issued",
        patientName: selectedPatient?.name,
        details: `${rxMedication} (${rxDosage})`
      });

      setTimeout(() => setRecentCallAlert(null), 3500);

      setSelectedPatient(null);
      setRxMedication("");
      setRxDosage("");
      setRxNotes("");
    } catch {
      setSelectedPatient(null);
    } finally {
      setSavingRx(false);
    }
  };

  const patientsList = [
    { token: "#A-12", name: "Rahul Sharma", time: "10:00 AM", type: "General Consultation", status: "completed" },
    { token: "#A-13", name: "Ananya Roy", time: "10:15 AM", type: "Cardiology Follow-up", status: "completed" },
    { token: "#A-14", name: "Soumen Pore", time: "10:30 AM", type: "ECG & Heart Checkup", status: "next" },
    { token: "#A-15", name: "Priya Das", time: "11:00 AM", type: "Blood Pressure Review", status: "waiting" },
    { token: "#A-16", name: "Amitav Ghosh", time: "11:30 AM", type: "Chest Pain Initial", status: "waiting" },
  ];

  const filteredPatients = patientsList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.token.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "next") return matchesSearch && p.status === "next";
    if (activeTab === "waiting") return matchesSearch && p.status === "waiting";
    if (activeTab === "completed") return matchesSearch && p.status === "completed";
    return matchesSearch;
  });

  return (
    <div className="dashboard fade-in">
      {/* Toast Alert Banner */}
      {recentCallAlert && (
        <div style={{
          position: "fixed",
          top: "80px",
          right: "24px",
          zIndex: 1100,
          background: "rgba(16, 185, 129, 0.95)",
          backdropFilter: "blur(12px)",
          color: "#042f22",
          padding: "16px 24px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(16, 185, 129, 0.4)",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          animation: "slideIn 0.3s ease",
          border: "1px solid rgba(255,255,255,0.3)"
        }}>
          <Volume2 size={24} className="pulse-icon" />
          <div>
            <strong style={{ fontSize: "15px", display: "block" }}>
              {recentCallAlert.title || "📢 Token Called Live!"}
            </strong>
            <span style={{ fontSize: "13px", fontWeight: "600" }}>
              {recentCallAlert.token ? `Called ${recentCallAlert.patientName} (${recentCallAlert.token}) to ${recentCallAlert.room}` : recentCallAlert.details}
            </span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="dashboard-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <p className="eyebrow" style={{ margin: 0 }}>DOCTOR PORTAL · CLINIC QUEUE ENGINE</p>
            <span className="status-badge confirmed" style={{ padding: "3px 10px", fontSize: "11px" }}>
              <Radio size={12} style={{ color: isSocketConnected ? "#10b981" : "#f59e0b" }} />
              {isSocketConnected ? "Socket IO Connected" : "Connecting..."}
            </span>
          </div>
          <h1 style={{ marginTop: "6px" }}>Welcome, Dr. {doctorName} 👋</h1>
          <p className="dashboard-subtitle">Manage today's appointments, broadcast token calls, and issue digital prescriptions.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="primary-button" onClick={() => handleServeNext(patientsList[2])}>
            <Sparkles size={16} /> Call Next Token (#A-{(facility?.currentToken ?? 12) + 1})
          </button>
        </div>
      </div>

      {/* Doctor Availability Bar */}
      <div className="doctor-status-card" style={{
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "20px",
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        boxShadow: "var(--shadow-sm)"
      }}>
        <div className="doctor-status-left" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="doctor-status-icon" style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: statusMode === "present" ? "var(--color-primary-glow)" : statusMode === "consultation" ? "rgba(59, 130, 246, 0.15)" : "rgba(245, 158, 11, 0.15)",
            color: statusMode === "present" ? "var(--color-primary-light)" : statusMode === "consultation" ? "#60a5fa" : "var(--color-warning)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <UserCheck size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Live Doctor Availability Broadcast</h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "13px", marginTop: "2px" }}>
              Status:{" "}
              <strong style={{ 
                color: statusMode === "present" ? "var(--color-primary-light)" : statusMode === "consultation" ? "#60a5fa" : "var(--color-warning)" 
              }}>
                {statusMode === "present" ? "🟢 Present & Accepting Patients" : statusMode === "consultation" ? "🔵 In Consultation (Busy)" : "🟡 Marked Away / On Break"}
              </strong>
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            className={`status-toggle-btn ${statusMode === "present" ? "active" : ""}`}
            onClick={() => handleStatusChange("present")}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "13px",
              border: "1px solid var(--color-border)",
              background: statusMode === "present" ? "var(--color-primary-glow)" : "var(--color-bg-elevated)",
              color: statusMode === "present" ? "var(--color-primary-light)" : "var(--color-text-secondary)",
              transition: "all 0.2s ease"
            }}
          >
            Present
          </button>
          <button 
            className={`status-toggle-btn ${statusMode === "consultation" ? "active" : ""}`}
            onClick={() => handleStatusChange("consultation")}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "13px",
              border: "1px solid var(--color-border)",
              background: statusMode === "consultation" ? "rgba(59, 130, 246, 0.2)" : "var(--color-bg-elevated)",
              color: statusMode === "consultation" ? "#60a5fa" : "var(--color-text-secondary)",
              transition: "all 0.2s ease"
            }}
          >
            In Consult
          </button>
          <button 
            className={`status-toggle-btn ${statusMode === "away" ? "active" : ""}`}
            onClick={() => handleStatusChange("away")}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "13px",
              border: "1px solid var(--color-border)",
              background: statusMode === "away" ? "rgba(245, 158, 11, 0.2)" : "var(--color-bg-elevated)",
              color: statusMode === "away" ? "var(--color-warning)" : "var(--color-text-secondary)",
              transition: "all 0.2s ease"
            }}
          >
            Mark Away
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Calendar size={26} />
          </div>
          <div className="stat-card-info">
            <span>Today's Schedule</span>
            <strong>12 Booked</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
            <Users size={26} />
          </div>
          <div className="stat-card-info">
            <span>Serving Token Counter</span>
            <strong style={{ color: "#60a5fa" }}>#A-{facility?.currentToken ?? 12}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <CheckCircle2 size={26} />
          </div>
          <div className="stat-card-info">
            <span>Completed</span>
            <strong>2 Consulted</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--color-warning)" }}>
            <Clock size={26} />
          </div>
          <div className="stat-card-info">
            <span>Avg Consult Time</span>
            <strong>12 mins</strong>
          </div>
        </div>
      </div>

      {/* Patient Schedule Table Panel */}
      <div className="card-panel">
        <div className="panel-title-bar" style={{ flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2>Today's Live Patient Queue</h2>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
              Click "Call Token" to announce token over Socket.IO stream to patient mobile devices.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <div className="input-wrapper" style={{ width: "220px" }}>
              <Search size={15} className="text-muted" />
              <input 
                type="text" 
                placeholder="Search patient name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
              {["all", "next", "waiting", "completed"].map((tab) => (
                <button
                  key={tab}
                  className={`status-toggle-btn ${activeTab === tab ? "active" : ""}`}
                  style={{ textTransform: "capitalize", padding: "6px 14px", fontSize: "12px", whiteSpace: "nowrap" }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="table-responsive-wrapper">
          <table className="patient-queue-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Patient Name</th>
                <th>Time Slot</th>
                <th>Visit Purpose</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.token}>
                  <td>
                    <strong style={{ color: "var(--color-primary-light)", fontSize: "15px" }}>{patient.token}</strong>
                  </td>
                  <td>
                    <strong style={{ color: "var(--color-text-primary)" }}>{patient.name}</strong>
                  </td>
                  <td>{patient.time}</td>
                  <td>{patient.type}</td>
                  <td>
                    {patient.status === "completed" && <span className="status-badge confirmed">Completed</span>}
                    {patient.status === "next" && <span className="status-badge confirmed"><span className="status-dot-pulse"></span> Next Up</span>}
                    {patient.status === "waiting" && <span className="status-badge away">Waiting</span>}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button 
                        className="secondary-button" 
                        style={{ padding: "8px 14px", fontSize: "12px", gap: "6px" }}
                        onClick={() => handleServeNext(patient)}
                      >
                        <PhoneCall size={14} style={{ color: "var(--color-primary-light)" }} /> Call Token
                      </button>
                      <button 
                        className="primary-button" 
                        style={{ padding: "8px 14px", fontSize: "12px", gap: "6px" }}
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <FileText size={14} /> Issue Prescription
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EHR Prescription Writer Modal */}
      {selectedPatient && (
        <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
          <div className="modal-card fade-in" onClick={(e) => e.stopPropagation()} style={{
            background: "var(--color-bg-surface)", borderRadius: "20px", padding: "28px",
            maxWidth: "520px", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-lg)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "19px", fontWeight: "800", color: "var(--color-text-primary)" }}>
                Digital Prescription Writer
              </h2>
              <button onClick={() => setSelectedPatient(null)} className="nav-icon-btn">
                <X size={18} />
              </button>
            </div>

            <div style={{
              background: "var(--color-bg-elevated)",
              padding: "12px 16px",
              borderRadius: "12px",
              marginBottom: "20px",
              border: "1px solid var(--color-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: "700" }}>PATIENT</span>
                <p style={{ fontWeight: "700", fontSize: "15px" }}>{selectedPatient.name}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: "700" }}>TOKEN</span>
                <p style={{ fontWeight: "800", fontSize: "15px", color: "var(--color-primary-light)" }}>{selectedPatient.token}</p>
              </div>
            </div>

            <form onSubmit={handleSaveEHR} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-text-secondary)" }}>Medication Name & Strength</label>
                <input 
                  type="text" 
                  placeholder="e.g. Amoxicillin 500mg, Atorvastatin 10mg..." 
                  value={rxMedication} 
                  onChange={(e) => setRxMedication(e.target.value)} 
                  required 
                  style={{ width: "100%", marginTop: "6px", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "12px", color: "var(--color-text-primary)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-text-secondary)" }}>Dosage & Timing Instructions</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1 tablet twice daily after meals for 5 days" 
                  value={rxDosage} 
                  onChange={(e) => setRxDosage(e.target.value)} 
                  required 
                  style={{ width: "100%", marginTop: "6px", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "12px", color: "var(--color-text-primary)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-text-secondary)" }}>Clinical Notes</label>
                <textarea 
                  rows={3} 
                  placeholder="Clinical observations and advice..." 
                  value={rxNotes} 
                  onChange={(e) => setRxNotes(e.target.value)} 
                  style={{ width: "100%", marginTop: "6px", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "12px", color: "var(--color-text-primary)" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button type="button" className="secondary-button" onClick={() => setSelectedPatient(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={savingRx} style={{ flex: 1 }}>
                  {savingRx ? "Issuing..." : "Issue Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;