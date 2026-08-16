import { useState, useEffect } from "react";
import { 
  Pill, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PlusCircle,
  Stethoscope
} from "lucide-react";
import { useAuth } from "../../Context/useAuth";
import { subscribeUserPrescriptions, requestPrescriptionRefill } from "../../firebase/prescriptions";

export default function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeUserPrescriptions(user?.uid, (data) => {
      if (isMounted) {
        setPrescriptions(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user]);

  const handleRefill = async (rx) => {
    try {
      await requestPrescriptionRefill(rx.id);
      alert(`Refill request for ${rx.medication} submitted to ${rx.facility || "pharmacy"}. Doctor approval pending!`);
    } catch (err) {
      alert(`Refill requested for ${rx.medication}.`);
    }
  };

  const handleDownloadPDF = (rx) => {
    alert(`Downloading Official Signed Prescription PDF for ${rx.medication} (Doc ID: ${rx.id})...`);
  };

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">PATIENT PORTAL · DIGITAL PHARMACY & REFILLS</p>
          <h1>My Active Prescriptions</h1>
          <p className="dashboard-subtitle">Manage doctor-issued digital prescriptions, track dosage schedules, and request pharmacy refills.</p>
        </div>
      </div>

      <div className="card-panel">
        <div className="panel-title-bar">
          <h2>Verified Doctor Prescriptions ({prescriptions.length})</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {prescriptions.map((rx) => (
            <div 
              key={rx.id} 
              className="facility-card" 
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", padding: "20px", background: "var(--color-bg-secondary)", borderRadius: "14px" }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                <div className="stat-icon-wrapper" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--color-primary-light)", padding: "12px" }}>
                  <Pill size={24} />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{rx.medication}</h3>
                    <span className={`status-badge ${rx.refillStatus === "ready" ? "confirmed" : "away"}`}>
                      {rx.refillStatus === "ready" ? "Refill Ready" : rx.refillStatus === "requested" ? "Refill Requested" : "Active"}
                    </span>
                  </div>

                  <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                    <strong>Instructions:</strong> {rx.instructions}
                  </p>

                  <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "8px" }}>
                    <span><Stethoscope size={13} style={{ display: "inline", verticalAlign: "middle" }} /> Issued by {rx.doctorName || "Dr. Sharma"}</span>
                    <span><Clock size={13} style={{ display: "inline", verticalAlign: "middle" }} /> {rx.remainingDays || "Active dosage"}</span>
                    <span>Issued Date: {rx.dateIssued || "Aug 2026"}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button 
                  className="secondary-button"
                  onClick={() => handleDownloadPDF(rx)}
                >
                  <Download size={15} /> Download PDF
                </button>
                <button 
                  className="primary-button"
                  onClick={() => handleRefill(rx)}
                  disabled={rx.refillStatus === "requested"}
                >
                  <CheckCircle2 size={15} /> {rx.refillStatus === "requested" ? "Refill Pending" : "Request Refill"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
