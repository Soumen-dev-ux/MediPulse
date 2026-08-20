import { useState, useEffect } from "react";
import { 
  Stethoscope, 
  Search, 
  CheckCircle, 
  XCircle, 
  Award, 
  Building, 
  FileText, 
  X,
  Eye
} from "lucide-react";
import { 
  subscribeAllDoctors, 
  verifyDoctorProfile, 
  addAuditLog 
} from "../../../firebase/firestore";

// Fallback initial doctors if Firestore table is empty
const defaultDoctors = [
  {
    id: "doc_01",
    name: "Dr. Ananya Sharma",
    email: "ananya.sharma@medipulse.org",
    phone: "+91 XXXXX XXXXX",
    specialization: "Cardiology",
    licenseNo: "MCI-2021-9876",
    experience: "12 years",
    clinicName: "City Central Hospital",
    verificationStatus: "verified",
    documentName: "mci_license_sharma.pdf"
  },
  {
    id: "doc_02",
    name: "Dr. Rajesh Kumar",
    email: "rajesh.k@medipulse.org",
    phone: "+91 98444 55566",
    specialization: "Pediatrics",
    licenseNo: "MCI-2023-1122",
    experience: "7 years",
    clinicName: "Apollo Medical Hub",
    verificationStatus: "pending",
    documentName: "medical_license_kumar.pdf"
  },
  {
    id: "doc_03",
    name: "Dr. Vikram Sethi",
    email: "vikram.sethi@gmail.com",
    phone: "+91 98111 99887",
    specialization: "Neurology",
    licenseNo: "MCI-2018-5544",
    experience: "15 years",
    clinicName: "Fortis Health Clinic",
    verificationStatus: "verified",
    documentName: "neurology_cert_sethi.pdf"
  },
  {
    id: "doc_04",
    name: "Dr. Sunita Deshmukh",
    email: "sunita.d@medipulse.org",
    phone: "+91 97666 44332",
    specialization: "Dermatology",
    licenseNo: "MCI-2024-7788",
    experience: "4 years",
    clinicName: "Care & Cure Clinic",
    verificationStatus: "pending",
    documentName: "dermatology_lic_deshmukh.pdf"
  }
];

export default function AdminDoctorsTab() {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected Doctor Details Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeAllDoctors((dbDocs) => {
      if (isMounted) {
        if (dbDocs && dbDocs.length > 0) {
          setDoctors(dbDocs);
        } else {
          setDoctors(defaultDoctors);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleUpdateVerification = async (docObj, newStatus) => {
    try {
      if (docObj.id.startsWith("doc_")) {
        setDoctors((prev) =>
          prev.map((d) => (d.id === docObj.id ? { ...d, verificationStatus: newStatus, adminNotes } : d))
        );
      } else {
        await verifyDoctorProfile(docObj.id, newStatus, adminNotes);
      }

      await addAuditLog(
        "Doctor Verification Status Changed",
        `Set ${docObj.name} (${docObj.licenseNo}) verification status to '${newStatus.toUpperCase()}'`,
        "Admin"
      );

      alert(`Doctor ${docObj.name} verification status set to: ${newStatus.toUpperCase()}`);
      setSelectedDoctor(null);
      setAdminNotes("");
    } catch (err) {
      console.error("Verification update error:", err);
      alert("Error updating status: " + err.message);
    }
  };

  const filteredDoctors = doctors.filter((d) => {
    const matchesSearch =
      (d.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.specialization || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.licenseNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.clinicName || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus =
      statusFilter === "all" || (d.verificationStatus || "pending").toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fade-in">
      {/* Search & Status Filter */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "280px" }}>
          <div className="input-wrapper" style={{ flex: 1 }}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search doctor by name, specialization, or license #..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--color-border)", background: "var(--color-bg-card)", color: "var(--color-text-main)", fontSize: "14px", fontWeight: "500" }}
          >
            <option value="all">All Verification Statuses</option>
            <option value="pending">Pending Approval ⏳</option>
            <option value="verified">Verified ✅</option>
            <option value="rejected">Rejected / Suspended ❌</option>
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
        {filteredDoctors.map((docItem) => (
          <div key={docItem.id} className="admin-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div className="stat-icon-wrapper" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
                    <Stethoscope size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "700" }}>{docItem.name}</h3>
                    <span style={{ fontSize: "12px", color: "var(--color-primary-light)", fontWeight: "600" }}>
                      {docItem.specialization}
                    </span>
                  </div>
                </div>

                <span className={`status-badge ${(docItem.verificationStatus || "pending") === "verified" ? "confirmed" : (docItem.verificationStatus || "pending") === "pending" ? "calling" : "away"}`}>
                  {(docItem.verificationStatus || "pending").toUpperCase()}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "var(--color-text-secondary)", margin: "14px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileText size={14} />
                  <span>License: <strong>{docItem.licenseNo || "MCI-PENDING"}</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Award size={14} />
                  <span>Experience: {docItem.experience || "N/A"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Building size={14} />
                  <span>Facility: {docItem.clinicName || "Independent Practice"}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", paddingTop: "12px", borderTop: "1px solid var(--color-border)" }}>
              <button 
                className="secondary-button" 
                style={{ flex: 1, padding: "8px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                onClick={() => {
                  setSelectedDoctor(docItem);
                  setAdminNotes(docItem.adminNotes || "");
                }}
              >
                <Eye size={14} /> Review Credentials
              </button>

              {(docItem.verificationStatus || "pending") !== "verified" ? (
                <button 
                  className="primary-button" 
                  style={{ padding: "8px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  onClick={() => handleUpdateVerification(docItem, "verified")}
                >
                  <CheckCircle size={14} /> Verify
                </button>
              ) : (
                <button 
                  className="danger-button" 
                  style={{ padding: "8px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  onClick={() => handleUpdateVerification(docItem, "rejected")}
                >
                  <XCircle size={14} /> Revoke
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="card-panel" style={{ textAlign: "center", padding: "40px", color: "var(--color-text-secondary)" }}>
          No doctor records found matching criteria.
        </div>
      )}

      {/* Review Modal */}
      {selectedDoctor && (
        <div className="modal-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="modal-content card-panel" style={{ maxWidth: "520px", width: "90%", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Doctor Verification Dossier</h2>
              <button onClick={() => setSelectedDoctor(null)} style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ background: "var(--color-bg-card)", padding: "14px", borderRadius: "10px", border: "1px solid var(--color-border)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700" }}>{selectedDoctor.name}</h3>
                <p style={{ color: "var(--color-primary-light)", fontSize: "13px", fontWeight: "600" }}>{selectedDoctor.specialization}</p>
                <p style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{selectedDoctor.email} · {selectedDoctor.phone}</p>
              </div>

              <div className="summary-box" style={{ margin: 0 }}>
                <div className="summary-row"><span>Registration License #</span><strong>{selectedDoctor.licenseNo}</strong></div>
                <div className="summary-row"><span>Practice Experience</span><strong>{selectedDoctor.experience}</strong></div>
                <div className="summary-row"><span>Affiliated Facility</span><strong>{selectedDoctor.clinicName}</strong></div>
                <div className="summary-row"><span>Submitted Document</span><strong>{selectedDoctor.documentName || "license_certificate.pdf"}</strong></div>
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px", display: "block" }}>Admin Verification Notes</label>
                <textarea 
                  rows={3}
                  placeholder="Enter medical council verification notes or comments..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg-card)", color: "var(--color-text-main)", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button 
                  className="danger-button" 
                  style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  onClick={() => handleUpdateVerification(selectedDoctor, "rejected")}
                >
                  <XCircle size={16} /> Reject Application
                </button>
                <button 
                  className="primary-button" 
                  style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  onClick={() => handleUpdateVerification(selectedDoctor, "verified")}
                >
                  <CheckCircle size={16} /> Approve & Verify Doctor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
