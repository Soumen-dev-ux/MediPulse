import { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Search, 
  Clock, 
  ShieldCheck, 
  RefreshCw,
  CheckCircle,
  Activity
} from "lucide-react";
import { subscribeAuditLogs, addAuditLog } from "../../../firebase/firestore";

const defaultAuditLogs = [
  { id: "log_01", action: "Queue Token Served", details: "Served token #A-102 at City Central Hospital (Cardiology)", performedBy: "Admin", timestamp: "2026-08-18 00:10:15" },
  { id: "log_02", action: "Doctor Verified", details: "Approved verification credentials for Dr. Ananya Sharma (MCI-2021-9876)", performedBy: "Admin", timestamp: "2026-08-17 23:45:00" },
  { id: "log_03", action: "Walk-in Token Issued", details: "Issued Queue Token #A-103 for walk-in patient (+919876543210)", performedBy: "Admin", timestamp: "2026-08-17 22:30:10" },
  { id: "log_04", action: "User Role Updated", details: "Promoted user Soumen Pore (patient@medipulse.org) role permissions", performedBy: "Admin", timestamp: "2026-08-17 21:15:04" },
  { id: "log_05", action: "Facility Status Changed", details: "Updated Apollo Medical Hub operational status to 'Operational'", performedBy: "Admin", timestamp: "2026-08-17 19:00:22" }
];

export default function AdminLogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeAuditLogs((dbLogs) => {
      if (isMounted) {
        if (dbLogs && dbLogs.length > 0) {
          // Sort newest first
          const sorted = [...dbLogs].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
          setLogs(sorted);
        } else {
          setLogs(defaultAuditLogs);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["ID", "Action", "Details", "PerformedBy", "Timestamp"];
    const rows = logs.map((l) => [
      `"${l.id}"`,
      `"${l.action}"`,
      `"${(l.details || "").replace(/"/g, '""')}"`,
      `"${l.performedBy || "Admin"}"`,
      `"${l.timestamp || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MediPulse_Audit_Logs_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addAuditLog("Exported Logs CSV", "Downloaded administrative audit trail report in CSV format", "Admin");
  };

  const filteredLogs = logs.filter((l) => {
    return (
      (l.action || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.details || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.performedBy || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="fade-in">
      {/* Header & Export Action */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
        <div className="input-wrapper" style={{ flex: 1, minWidth: "280px" }}>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search audit trail by action, details, or admin user..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button 
          className="primary-button" 
          onClick={handleExportCSV}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          <Download size={18} /> Export Audit Log (CSV)
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="card-panel">
        <div className="panel-title-bar">
          <h2>System Operational Audit Log ({filteredLogs.length})</h2>
          <span className="status-badge confirmed">Live Audit Stream</span>
        </div>

        {loading ? (
          <p style={{ padding: "20px", color: "var(--color-text-secondary)" }}>Loading system activity trail...</p>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="patient-queue-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Activity Description</th>
                  <th>Performed By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: "12px", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Clock size={13} />
                        {log.timestamp ? log.timestamp : "Recent"}
                      </div>
                    </td>
                    <td>
                      <strong style={{ fontSize: "13px", color: "var(--color-primary-light)" }}>{log.action}</strong>
                    </td>
                    <td style={{ fontSize: "13px" }}>
                      {log.details}
                    </td>
                    <td>
                      <span className="status-badge confirmed" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
                        {log.performedBy || "Admin"}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge confirmed" style={{ padding: "4px 8px", fontSize: "11px" }}>
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "30px", color: "var(--color-text-secondary)" }}>
                      No matching audit log entries found.
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
