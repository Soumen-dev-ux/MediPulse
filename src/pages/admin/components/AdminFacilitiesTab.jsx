import { useState, useEffect } from "react";
import { 
  Hospital, 
  ShieldCheck, 
  Activity, 
  Phone, 
  Plus, 
  RotateCcw, 
  ChevronRight, 
  MapPin, 
  Pill, 
  Truck, 
  Clock,
  Edit,
  X,
  Building,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { 
  subscribeToFacility, 
  serveNextPatient, 
  generateQueueToken, 
  resetQueueToken, 
  subscribeIssuedTokens 
} from "../../../firebase/facilities";
import { 
  subscribeAllFacilities, 
  updateFacilityDetails, 
  addAuditLog 
} from "../../../firebase/firestore";

const defaultFacilities = [
  {
    id: "city-central",
    name: "City Central Hospital (Main Campus)",
    address: "Block B, Floor 3, Park Street, Main Campus",
    phone: "+91 33 2289 4000",
    status: "Operational",
    hasPharmacy: true,
    pharmacyDetails: { deliveryEnabled: true, freeDeliveryRadiusKm: 3 },
    currentToken: 1,
    lastToken: 1,
    departments: ["Cardiology", "General Medicine", "Pediatrics", "OPD", "Emergency"]
  },
  {
    id: "apollo-hub",
    name: "Apollo Medical Center",
    address: "Sector V, Salt Lake, Kolkata",
    phone: "+91 33 6612 0000",
    status: "Operational",
    hasPharmacy: true,
    pharmacyDetails: { deliveryEnabled: true, freeDeliveryRadiusKm: 5 },
    currentToken: 4,
    lastToken: 8,
    departments: ["Neurology", "Orthopedics", "OPD"]
  },
  {
    id: "fortis-care",
    name: "Fortis Healthcare Facility",
    address: "EM Bypass, Anandapur, Kolkata",
    phone: "+91 33 6622 3000",
    status: "Maintenance",
    hasPharmacy: false,
    currentToken: 0,
    lastToken: 0,
    departments: ["OPD", "Cardiology"]
  }
];

export default function AdminFacilitiesTab() {
  const [facilities, setFacilities] = useState(defaultFacilities);
  const [selectedFacilityId, setSelectedFacilityId] = useState("city-central");
  const [liveFacility, setLiveFacility] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("Cardiology");
  const [phonePatientNumber, setPhonePatientNumber] = useState("");
  const [phonePatientName, setPhonePatientName] = useState("");
  const [issuedTokensHistory, setIssuedTokensHistory] = useState([]);

  // Facility Settings Modal State
  const [editingFacility, setEditingFacility] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStatus, setEditStatus] = useState("Operational");
  const [editHasPharmacy, setEditHasPharmacy] = useState(true);

  // Subscribe to all facilities in Firestore
  useEffect(() => {
    let isMounted = true;
    const unsubscribeAll = subscribeAllFacilities((dbFacilities) => {
      if (isMounted && dbFacilities && dbFacilities.length > 0) {
        setFacilities(dbFacilities);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAll();
    };
  }, []);

  // Subscribe to live selected facility
  useEffect(() => {
    let isMounted = true;
    const unsubscribeLive = subscribeToFacility((data) => {
      if (isMounted && data) {
        setLiveFacility(data);
      }
    }, selectedFacilityId);

    const unsubscribeTokens = subscribeIssuedTokens((tokens) => {
      if (isMounted) {
        setIssuedTokensHistory(tokens);
      }
    }, selectedFacilityId);

    return () => {
      isMounted = false;
      unsubscribeLive();
      unsubscribeTokens();
    };
  }, [selectedFacilityId]);

  const activeFacility = liveFacility || facilities.find((f) => f.id === selectedFacilityId) || defaultFacilities[0];
  const currentToken = activeFacility?.currentToken ?? 1;

  const handleNextToken = async () => {
    try {
      await serveNextPatient(selectedFacilityId);
      await addAuditLog(
        "Token Served",
        `Served next token for ${activeFacility.name} (${selectedDepartment})`,
        "Admin"
      );
    } catch (err) {
      console.error("Failed to serve token:", err);
      // Local state fallback
      setLiveFacility((prev) => ({
        ...prev,
        currentToken: (prev?.currentToken || 1) + 1
      }));
    }
  };

  const handleResetToken = async () => {
    if (window.confirm(`Reset queue token counter to #A-1 for ${activeFacility.name}?`)) {
      try {
        await resetQueueToken(selectedFacilityId);
        await addAuditLog("Queue Reset", `Reset live queue counter for ${activeFacility.name}`, "Admin");
      } catch (err) {
        console.error("Failed to reset queue token:", err);
        setLiveFacility((prev) => ({
          ...prev,
          currentToken: 1,
          lastToken: 1
        }));
      }
    }
  };

  const handleIssuePhoneToken = async (e) => {
    e.preventDefault();
    if (!phonePatientNumber) return;

    try {
      const newToken = await generateQueueToken(
        selectedFacilityId, 
        phonePatientNumber, 
        phonePatientName || "Walk-in Patient", 
        selectedDepartment
      );

      const msg = `Issued Queue Token #A-${newToken} for ${phonePatientName || "Walk-in"} (${phonePatientNumber}) in ${selectedDepartment} department. SMS dispatched!`;
      await addAuditLog("Walk-in Token Issued", msg, "Admin");

      alert(msg);
      setPhonePatientNumber("");
      setPhonePatientName("");
    } catch (err) {
      console.error("Issue token error:", err);
      alert("Token generated locally. Token #A-" + ((activeFacility.lastToken || 1) + 1));
    }
  };

  const handleSaveFacilitySettings = async (e) => {
    e.preventDefault();
    if (!editingFacility) return;

    try {
      const updates = {
        name: editName,
        address: editAddress,
        phone: editPhone,
        status: editStatus,
        hasPharmacy: editHasPharmacy
      };

      if (!editingFacility.id.startsWith("city-") && !editingFacility.id.startsWith("apollo-")) {
        await updateFacilityDetails(editingFacility.id, updates);
      }

      setFacilities((prev) =>
        prev.map((f) => (f.id === editingFacility.id ? { ...f, ...updates } : f))
      );

      await addAuditLog(
        "Facility Settings Updated",
        `Updated settings for ${editName} (Status: ${editStatus})`,
        "Admin"
      );

      alert(`Facility settings updated for ${editName}.`);
      setEditingFacility(null);
    } catch (err) {
      console.error("Failed to save facility settings:", err);
      alert("Error saving settings: " + err.message);
    }
  };

  return (
    <div className="fade-in">
      {/* Facility Selector */}
      <div className="card-panel" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span className="eyebrow">FACILITY NODE SELECTOR</span>
            <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Manage Facility Controls & Department Queues</h2>
          </div>

          <select 
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            style={{ padding: "10px 16px", borderRadius: "10px", border: "1px solid var(--color-primary)", background: "var(--color-bg-card)", color: "var(--color-text-main)", fontSize: "15px", fontWeight: "700" }}
          >
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                🏥 {f.name} ({f.status || "Operational"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Network Status & Queue Controller */}
      <div className="admin-grid" style={{ marginBottom: "24px" }}>
        {/* Facility Status Card */}
        <div className="admin-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="card-header">
              <div className="card-icon">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{activeFacility.name}</h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>{activeFacility.address}</p>
              </div>
            </div>

            <div style={{ margin: "16px 0" }}>
              <span className={`status-badge ${activeFacility.status === "Operational" ? "confirmed" : "away"}`} style={{ padding: "8px 16px", fontSize: "13px" }}>
                <span className="status-dot-pulse"></span> Status: {activeFacility.status || "Operational"}
              </span>
            </div>

            <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div>📞 Emergency Contact: <strong>{activeFacility.phone || "+91 33 2289 4000"}</strong></div>
              <div>💊 Attached Pharmacy: <strong>{activeFacility.hasPharmacy ? "Available (Delivery Enabled)" : "No Pharmacy"}</strong></div>
            </div>
          </div>

          <button 
            className="secondary-button full" 
            style={{ marginTop: "16px" }}
            onClick={() => {
              setEditingFacility(activeFacility);
              setEditName(activeFacility.name || "");
              setEditAddress(activeFacility.address || "");
              setEditPhone(activeFacility.phone || "");
              setEditStatus(activeFacility.status || "Operational");
              setEditHasPharmacy(activeFacility.hasPharmacy ?? true);
            }}
          >
            <Edit size={16} /> Edit Facility Node Settings
          </button>
        </div>

        {/* Live Queue Controller Card */}
        <div className="admin-card">
          <div>
            <div className="card-header">
              <div className="card-icon">
                <Activity size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Live Queue Token Controller</h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>Department: {selectedDepartment}</p>
              </div>
            </div>

            {/* Department Picker */}
            <div style={{ display: "flex", gap: "6px", margin: "12px 0", overflowX: "auto" }}>
              {(activeFacility.departments || ["Cardiology", "General Medicine", "Pediatrics", "OPD"]).map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  style={{
                    padding: "4px 10px",
                    fontSize: "12px",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    background: selectedDepartment === dept ? "var(--color-primary)" : "var(--color-bg-card)",
                    color: selectedDepartment === dept ? "#fff" : "var(--color-text-main)",
                    cursor: "pointer"
                  }}
                >
                  {dept}
                </button>
              ))}
            </div>

            <div className="queue-display-box" style={{ margin: "14px 0" }}>
              <span>CURRENTLY SERVING TOKEN</span>
              <strong>#A-{currentToken}</strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              className="primary-button" 
              style={{ flex: 1 }}
              onClick={handleNextToken}
            >
              <ChevronRight size={16} /> Serve Next (#A-{currentToken + 1})
            </button>
            <button 
              className="secondary-button"
              onClick={handleResetToken}
              title="Reset Token Counter"
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Walk-in / Phone Token Dispenser */}
      <div className="card-panel" style={{ marginBottom: "24px" }}>
        <div className="panel-title-bar">
          <h2>Walk-in & Phone Patient Token Dispenser</h2>
          <span className="status-badge confirmed">Instant SMS Dispatch</span>
        </div>
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "12px" }}>
          Issue digital queue tokens for walk-in patients or callers directly from the Admin Console.
        </p>

        <form onSubmit={handleIssuePhoneToken} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div className="input-wrapper" style={{ flex: 1, minWidth: "180px" }}>
            <Phone size={18} />
            <input 
              type="tel" 
              placeholder="Patient Phone (+91XXXXXXXXXX)..." 
              value={phonePatientNumber}
              onChange={(e) => setPhonePatientNumber(e.target.value)}
              required
            />
          </div>

          <div className="input-wrapper" style={{ flex: 1, minWidth: "180px" }}>
            <input 
              type="text" 
              placeholder="Patient Name (Optional)..." 
              value={phonePatientName}
              onChange={(e) => setPhonePatientName(e.target.value)}
              style={{ paddingLeft: "14px" }}
            />
          </div>

          <button className="primary-button" type="submit" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Plus size={18} /> Dispense Token (#A-{(activeFacility.lastToken || 1) + 1})
          </button>
        </form>

        {/* Issued Token Log */}
        {issuedTokensHistory.length > 0 && (
          <div style={{ marginTop: "20px", borderTop: "1px solid var(--color-border)", paddingTop: "14px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "10px" }}>Recently Issued Tokens</h4>
            <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px" }}>
              {issuedTokensHistory.slice(0, 6).map((t) => (
                <div key={t.id || t.tokenCode} style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", padding: "10px 14px", borderRadius: "8px", minWidth: "140px" }}>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--color-primary-light)" }}>{t.tokenCode}</div>
                  <div style={{ fontSize: "12px", fontWeight: "600" }}>{t.patientName}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{t.patientPhone}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Facility Modal */}
      {editingFacility && (
        <div className="modal-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="modal-content card-panel" style={{ maxWidth: "520px", width: "90%", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Edit Facility Node Configuration</h2>
              <button onClick={() => setEditingFacility(null)} style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFacilitySettings} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "600" }}>Facility Name *</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg-card)", color: "var(--color-text-main)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "600" }}>Facility Address</label>
                <input 
                  type="text" 
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg-card)", color: "var(--color-text-main)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "600" }}>Emergency Phone Number</label>
                <input 
                  type="text" 
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg-card)", color: "var(--color-text-main)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "600" }}>Operational Status</label>
                <select 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  style={{ width: "100%", padding: "10px", marginTop: "4px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg-card)", color: "var(--color-text-main)" }}
                >
                  <option value="Operational">Operational (100% Online)</option>
                  <option value="Maintenance">Scheduled Maintenance</option>
                  <option value="Emergency Only">Emergency OPD Only</option>
                  <option value="Offline">Offline / Closed</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="secondary-button" style={{ flex: 1 }} onClick={() => setEditingFacility(null)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" style={{ flex: 1 }}>
                  Save Facility Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
