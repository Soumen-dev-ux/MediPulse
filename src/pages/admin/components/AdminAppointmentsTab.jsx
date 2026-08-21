import { useState, useEffect } from "react";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  CalendarDays,
  Clock3,
  UsersRound,
  Activity,
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
        return <span className="appointment-status confirmed"><span className="status-dot" />Confirmed</span>;
      case "completed":
        return <span className="appointment-status completed"><span className="status-dot" />Completed</span>;
      case "pending":
        return <span className="appointment-status pending"><span className="status-dot" />Pending</span>;
      case "cancelled":
        return <span className="appointment-status cancelled"><span className="status-dot" />Cancelled</span>;
      default:
        return <span className="appointment-status confirmed"><span className="status-dot" />{st}</span>;
    }
  };

  const appointmentCounts = appointments.reduce((counts, appointment) => {
    const status = (appointment.status || "confirmed").toLowerCase();
    if (status === "pending") counts.pending += 1;
    if (status === "confirmed") counts.confirmed += 1;
    if (status === "completed") counts.completed += 1;
    return counts;
  }, { pending: 0, confirmed: 0, completed: 0 });

  return (
    <div className="fade-in">
      <div className="appointments-heading">
        <div>
          <p className="eyebrow">OPERATIONS · LIVE SCHEDULE</p>
          <h2>Appointment control room</h2>
          <p>Review every booking across the MediPulse care network.</p>
        </div>
        <div className="sync-indicator"><Activity size={15} /> Live network sync</div>
      </div>

      <div className="appointment-summary-grid">
        <div className="appointment-summary-card">
          <div className="summary-icon total"><CalendarDays size={19} /></div>
          <div><span>Total bookings</span><strong>{appointments.length}</strong></div>
        </div>
        <div className="appointment-summary-card">
          <div className="summary-icon pending"><Clock3 size={19} /></div>
          <div><span>Awaiting approval</span><strong>{appointmentCounts.pending}</strong></div>
        </div>
        <div className="appointment-summary-card">
          <div className="summary-icon confirmed"><UsersRound size={19} /></div>
          <div><span>Confirmed visits</span><strong>{appointmentCounts.confirmed}</strong></div>
        </div>
        <div className="appointment-summary-card">
          <div className="summary-icon completed"><CheckCircle2 size={19} /></div>
          <div><span>Completed visits</span><strong>{appointmentCounts.completed}</strong></div>
        </div>
      </div>

      <div className="appointments-toolbar">
        <div className="input-wrapper appointment-search">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search patient, doctor, facility..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appointment-filter"
          >
            <option value="all">All Appointment Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending Approval</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

      <div className="card-panel">
        <div className="panel-title-bar">
          <div>
            <h2>All appointments</h2>
            <p className="panel-caption">{filteredAppointments.length} records match your current view</p>
          </div>
        </div>

        {loading ? (
          <div className="appointments-loading"><Activity size={18} /> Loading appointments...</div>
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
                        <strong className="appointment-person">{app.patientName}</strong>
                        <span className="appointment-ref">Ref: {app.id}</span>
                      </div>
                    </td>
                    <td>
                      <div className="appointment-doctor">{app.doctorName || "Pending assign"}</div>
                    </td>
                    <td>
                      <div className="appointment-location">
                        <div>{app.facilityName || "City Central Hospital"}</div>
                        <span>{app.department || "General"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="appointment-date">
                        <div>{app.date}</div>
                        <div>{app.time}</div>
                      </div>
                    </td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        {(app.status || "confirmed") !== "completed" && (app.status || "confirmed") !== "cancelled" && (
                          <>
                            <button 
                              className="secondary-button" 
                              style={{ padding: "7px 10px", fontSize: "11px" }}
                              onClick={() => handleMarkCompleted(app)}
                            >
                              <CheckCircle2 size={13} /> Complete
                            </button>
                            <button 
                              className="danger-button" 
                              style={{ padding: "7px 10px", fontSize: "11px" }}
                              onClick={() => handleCancelAppointment(app)}
                            >
                              <XCircle size={13} /> Cancel
                            </button>
                          </>
                        )}
                        {((app.status || "").toLowerCase() === "completed" || (app.status || "").toLowerCase() === "cancelled") && (
                          <span className="appointment-archived">Archived</span>
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
