import { useState, useEffect } from "react";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
} from "lucide-react";
import { subscribeAllAppointments, cancelAppointment } from "../../../firebase/appointments";
import { addAuditLog } from "../../../firebase/firestore";

const defaultAppointments = [
  {
    id: "app_101",
    patientName: "Soumen Pore",
    doctorName: "Dr. Ananya Sharma",
    facilityName: "City Central Hospital",
    department: "Cardiology",
    date: "2026-08-18",
    time: "10:30 AM",
    status: "confirmed"
  },
  {
    id: "app_102",
    patientName: "Priya Mukherjee",
    doctorName: "Dr. Rajesh Kumar",
    facilityName: "Apollo Medical Center",
    department: "Pediatrics",
    date: "2026-08-18",
    time: "02:00 PM",
    status: "pending"
  },
  {
    id: "app_103",
    patientName: "Amitabh Sen",
    doctorName: "Dr. Vikram Sethi",
    facilityName: "Fortis Health Clinic",
    department: "Neurology",
    date: "2026-08-17",
    time: "11:00 AM",
    status: "completed"
  },
  {
    id: "app_104",
    patientName: "Rahul Verma",
    doctorName: "Dr. Sunita Deshmukh",
    facilityName: "Care & Cure Clinic",
    department: "Dermatology",
    date: "2026-08-19",
    time: "04:15 PM",
    status: "confirmed"
  }
];

export default function AdminAppointmentsTab() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeAllAppointments((dbApps) => {
      if (isMounted) {
        if (dbApps && dbApps.length > 0) {
          setAppointments(dbApps);
        } else {
          setAppointments(defaultAppointments);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleCancelAppointment = async (appObj) => {
    if (window.confirm(`Are you sure you want to cancel the appointment for ${appObj.patientName}?`)) {
      try {
        if (appObj.id.startsWith("app_")) {
          setAppointments((prev) =>
            prev.map((a) => (a.id === appObj.id ? { ...a, status: "cancelled" } : a))
          );
        } else {
          await cancelAppointment(appObj.id);
        }
        await addAuditLog(
          "Appointment Cancelled",
          `Admin cancelled appointment #${appObj.id} for ${appObj.patientName}`,
          "Admin"
        );
        alert(`Appointment cancelled for ${appObj.patientName}.`);
      } catch (err) {
        console.error("Cancel appointment error:", err);
        alert("Error cancelling appointment: " + err.message);
      }
    }
  };

  const handleMarkCompleted = (appObj) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appObj.id ? { ...a, status: "completed" } : a))
    );
    addAuditLog("Appointment Completed", `Admin marked appointment #${appObj.id} as completed`, "Admin");
    alert(`Appointment for ${appObj.patientName} marked as Completed.`);
  };
  
  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      (a.patientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.doctorName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.facilityName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.department || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || (a.status || "confirmed").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (st) => {
    switch ((st || "confirmed").toLowerCase()) {
      case "confirmed":
        return <span className="status-badge confirmed">Confirmed</span>;
      case "completed":
        return <span className="status-badge confirmed" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>Completed</span>;
      case "pending":
        return <span className="status-badge calling">Pending</span>;
      case "cancelled":
        return <span className="status-badge away" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5" }}>Cancelled</span>;
      default:
        return <span className="status-badge confirmed">{st}</span>;
    }
  };

  return (
    <div className="fade-in">
      {/* Search & Status Filters */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "280px" }}>
          <div className="input-wrapper" style={{ flex: 1 }}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by patient, doctor, facility, or department..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--color-border)", background: "var(--color-bg-card)", color: "var(--color-text-main)", fontSize: "14px", fontWeight: "500" }}
          >
            <option value="all">All Appointment Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending Approval</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="card-panel">
        <div className="panel-title-bar">
          <h2>Network Appointments Log ({filteredAppointments.length})</h2>
          <span className="status-badge confirmed">Live Network Sync</span>
        </div>

        {loading ? (
          <p style={{ padding: "20px", color: "var(--color-text-secondary)" }}>Loading appointments...</p>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="patient-queue-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Assigned Doctor</th>
                  <th>Facility Node & Dept</th>
                  <th>Schedule Date & Time</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div>
                        <strong style={{ fontSize: "14px", display: "block" }}>{app.patientName}</strong>
                        <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>Ref: {app.id}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "13px", fontWeight: "600" }}>{app.doctorName || "Pending Assign"}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: "13px" }}>
                        <div>{app.facilityName || "City Central Hospital"}</div>
                        <span style={{ fontSize: "11px", color: "var(--color-primary-light)" }}>{app.department || "General"}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "13px" }}>
                        <div>{app.date}</div>
                        <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{app.time}</div>
                      </div>
                    </td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        {(app.status || "confirmed") !== "completed" && (app.status || "confirmed") !== "cancelled" && (
                          <>
                            <button 
                              className="secondary-button" 
                              style={{ padding: "5px 10px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                              onClick={() => handleMarkCompleted(app)}
                            >
                              <CheckCircle2 size={13} /> Complete
                            </button>
                            <button 
                              className="danger-button" 
                              style={{ padding: "5px 10px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                              onClick={() => handleCancelAppointment(app)}
                            >
                              <XCircle size={13} /> Cancel
                            </button>
                          </>
                        )}
                        {((app.status || "").toLowerCase() === "completed" || (app.status || "").toLowerCase() === "cancelled") && (
                          <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>Archived</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "var(--color-text-secondary)" }}>
                      No appointments matching filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
