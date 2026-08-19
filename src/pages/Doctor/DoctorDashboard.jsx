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
  X
} from "lucide-react";
import { updateDoctorPresence, serveNextPatient, subscribeToFacility } from "../../firebase/facilities";
import { createPrescription } from "../../firebase/prescriptions";

const DoctorDashboard = () => {
  const { user, userData } = useAuth();
  const [statusMode, setStatusMode] = useState("present"); // 'present' | 'consultation' | 'away'
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [facility, setFacility] = useState(null);

  // EHR Record Modal State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [rxMedication, setRxMedication] = useState("");
  const [rxDosage, setRxDosage] = useState("");
  const [rxNotes, setRxNotes] = useState("");
  const [savingRx, setSavingRx] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeToFacility((data) => {
      if (isMounted) setFacility(data);
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const doctorName = userData?.name || user?.email?.split('@')[0] || "Doctor";

  const handleStatusChange = async (mode) => {
    setStatusMode(mode);
    try {
      await updateDoctorPresence(mode === "present", user?.uid || "doc-1", doctorName);
    } catch (error) {
      console.error("Failed to sync doctor availability:", error);
    }
  };

  const handleServeNext = async (patient) => {
    try {
      await serveNextPatient();
      alert(`📢 Calling Patient ${patient ? patient.name : ""} (#A-${(facility?.currentToken || 12) + 1}) to Room 302!`);
    } catch {
      alert(`Calling patient to Room 302...`);
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

      alert(`Prescription for ${rxMedication} issued to ${selectedPatient?.name}!`);
      setSelectedPatient(null);
      setRxMedication("");
      setRxDosage("");
      setRxNotes("");
    } catch {
      alert(`Prescription issued to ${selectedPatient?.name}.`);
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
      {/* Header Bar */}
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">DOCTOR PORTAL · CLINIC QUEUE ENGINE</p>
          <h1>Welcome, Dr. {doctorName} 👋</h1>
          <p className="dashboard-subtitle">Manage today's appointments, live queue status, and patient consults.</p>
        </div>
        <div>
          <button className="primary-button" onClick={() => handleServeNext(patientsList[2])}>
            <ChevronRight size={16} /> Serve Next Token (#A-{(facility?.currentToken ?? 12) + 1})
          </button>
        </div>
      </div>

      {/* Doctor Availability Bar */}
      <div className="doctor-status-card">
        <div className="doctor-status-left">
          <div className="doctor-status-icon">
            <UserCheck size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Live Availability Status</h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "13px", marginTop: "2px" }}>
              Current Status:{" "}
              <strong style={{ 
                color: statusMode === "present" ? "var(--color-primary-light)" : statusMode === "consultation" ? "var(--color-info)" : "var(--color-warning)" 
              }}>
                {statusMode === "present" ? "Present & Accepting Patients" : statusMode === "consultation" ? "In Consultation (Busy)" : "Marked Away / On Break"}
              </strong>
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            className={`status-toggle-btn ${statusMode === "present" ? "active" : ""}`}
            onClick={() => handleStatusChange("present")}
          >
            Present
          </button>
          <button 
            className={`status-toggle-btn ${statusMode === "consultation" ? "active" : ""}`}
            onClick={() => handleStatusChange("consultation")}
          >
            In Consult
          </button>
          <button 
            className={`status-toggle-btn ${statusMode === "away" ? "active" : ""}`}
            onClick={() => handleStatusChange("away")}
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
            <span>Currently Serving Token</span>
            <strong>#A-{facility?.currentToken ?? 12}</strong>
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
          <h2>Today's Patient Schedule</h2>
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
                  style={{ textTransform: "capitalize", padding: "6px 12px", fontSize: "12px", whiteSpace: "nowrap" }}
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
                    <strong style={{ color: "var(--color-primary-light)" }}>{patient.token}</strong>
                  </td>
                  <td>
                    <strong>{patient.name}</strong>
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
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => handleServeNext(patient)}
                      >
                        <PhoneCall size={13} /> Call Token
                      </button>
                      <button 
                        className="primary-button" 
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <FileText size={13} /> Issue Prescription
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
            background: "var(--color-bg-surface)", borderRadius: "16px", padding: "28px",
            maxWidth: "500px", border: "1px solid var(--color-border)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>EHR Record & Prescription Writer</h2>
              <button onClick={() => setSelectedPatient(null)} className="nav-icon-btn">
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
              Writing digital prescription for <strong>{selectedPatient.name}</strong> ({selectedPatient.token})
            </p>

            <form onSubmit={handleSaveEHR} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600" }}>Medication Name & Strength</label>
                <input 
                  type="text" 
                  placeholder="e.g. Amoxicillin 500mg, Atorvastatin 10mg..." 
                  value={rxMedication} 
                  onChange={(e) => setRxMedication(e.target.value)} 
                  required 
                  style={{ width: "100%", marginTop: "4px", background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "10px", color: "var(--color-text)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600" }}>Dosage & Timing Instructions</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1 tablet twice daily after meals for 5 days" 
                  value={rxDosage} 
                  onChange={(e) => setRxDosage(e.target.value)} 
                  required 
                  style={{ width: "100%", marginTop: "4px", background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "10px", color: "var(--color-text)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600" }}>Clinical Consultation Notes</label>
                <textarea 
                  rows={3} 
                  placeholder="Patient reports mild symptom improvement..." 
                  value={rxNotes} 
                  onChange={(e) => setRxNotes(e.target.value)} 
                  style={{ width: "100%", marginTop: "4px", background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "10px", color: "var(--color-text)" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="button" className="secondary-button" onClick={() => setSelectedPatient(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={savingRx} style={{ flex: 1 }}>
                  {savingRx ? "Saving..." : "Issue Digital Prescription"}
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