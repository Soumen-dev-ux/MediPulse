import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Building2,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileText,
  Navigation,
  Pill,
  Truck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { registerWithEmail } from "../../firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { registerClinic } from "../../firebase/firestore";

const TOTAL_STEPS = 3;

export default function ClinicRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);

  // Step 1
  const [clinicName, setClinicName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  // Step 2
  const [licenseNo, setLicenseNo] = useState("");
  const [licenseDocName, setLicenseDocName] = useState("");
  const [hasPharmacy, setHasPharmacy] = useState(false);
  const [drugLicenseNo, setDrugLicenseNo] = useState("");
  const [drugLicenseDocName, setDrugLicenseDocName] = useState("");
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [freeDeliveryRadius, setFreeDeliveryRadius] = useState("2");
  const [courierEnabled, setCourierEnabled] = useState(false);

  const handleGetGPS = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setGpsLoading(false);
      },
      (err) => {
        setError("Could not get location: " + err.message);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const nextStep = (e) => {
    e.preventDefault();
    setError("");
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setError("");
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await registerWithEmail(email, password);

      await setDoc(doc(db, "users", user.uid), {
        name: clinicName,
        email,
        phone,
        role: "admin",
        authProvider: "password",
        createdAt: serverTimestamp(),
      });

      const clinicData = {
        name: clinicName,
        email,
        phone,
        address,
        location: {
          lat: parseFloat(lat) || 0,
          lng: parseFloat(lng) || 0,
        },
        licenseNo,
        licenseDocName,
        hasPharmacy,
        pharmacyDetails: hasPharmacy
          ? {
              drugLicenseNo,
              drugLicenseDocName,
              deliveryEnabled,
              localDeliverySettings: deliveryEnabled
                ? {
                    freeDeliveryRadiusKm: parseFloat(freeDeliveryRadius) || 2,
                    expressDeliveryCourierEnabled: courierEnabled,
                  }
                : null,
            }
          : null,
      };

      await registerClinic(user.uid, clinicData);
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page registration-page--clinic fade-in">
      <div className="auth-card registration-card registration-card--clinic">
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <Activity size={24} />
          MediPulse
        </Link>

        {/* Step Indicator */}
        <div className="step-indicator">
          {[1, 2, 3].map((s) => (
            <div key={s} className="step-item">
              <div className={`step-dot ${step >= s ? "active" : ""} ${step > s ? "done" : ""}`}>
                {step > s ? <CheckCircle2 size={14} /> : s}
              </div>
              <span className={`step-label ${step === s ? "active" : ""}`}>
                {s === 1 ? "Basic Info" : s === 2 ? "Regulatory" : "Review"}
              </span>
              {s < 3 && <ChevronRight size={14} className="step-arrow" />}
            </div>
          ))}
        </div>

        {/* Heading */}
        <div className="registration-heading">
          <span className="reg-eyebrow">CLINIC / NURSING HOME REGISTRATION · STEP {step} OF {TOTAL_STEPS}</span>
          <h1>
            {step === 1 && "Basic Information"}
            {step === 2 && "Regulatory Details & Pharmacy Setup"}
            {step === 3 && "Review & Confirm"}
          </h1>
          <p className="auth-subtitle">
            {step === 1 && "Your facility's contact details and GPS location."}
            {step === 2 && "License information and optional pharmacy/delivery setup."}
            {step === 3 && "Review your details before submitting."}
          </p>
        </div>

        {error && <div className="error-box">{error}</div>}

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <form onSubmit={nextStep} className="auth-form">
            <div>
              <label>Clinic / Nursing Home Name *</label>
              <div className="input-wrapper" style={{ marginTop: "6px" }}>
                <Building2 size={18} />
                <input type="text" placeholder="ABC Medical Center / Sunrise Nursing Home" value={clinicName} onChange={(e) => setClinicName(e.target.value)} required />
              </div>
            </div>

            <div>
              <label>Official Email Address *</label>
              <div className="input-wrapper" style={{ marginTop: "6px" }}>
                <Mail size={18} />
                <input type="email" placeholder="clinic@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div>
              <label>Password *</label>
              <div className="input-wrapper" style={{ marginTop: "6px" }}>
                <Lock size={18} />
                <input type="password" placeholder="Minimum 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
              </div>
            </div>

            <div>
              <label>Official Phone Number <span className="public-tag">PUBLIC ✅</span></label>
              <div className="input-wrapper" style={{ marginTop: "6px" }}>
                <Phone size={18} />
                <input type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <p className="field-hint">Patients can call your facility directly from the map directory.</p>
            </div>

            <div>
              <label>Exact Address *</label>
              <div className="input-wrapper" style={{ marginTop: "6px" }}>
                <MapPin size={18} />
                <input type="text" placeholder="123 Medical Park, Sector V, Kolkata" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
            </div>

            {/* Geolocation */}
            <div>
              <label>Facility Geolocation</label>
              <button
                type="button"
                className="secondary-button"
                style={{ width: "100%", marginTop: "6px", marginBottom: "10px" }}
                onClick={handleGetGPS}
                disabled={gpsLoading}
              >
                <Navigation size={16} />
                {gpsLoading ? "Getting Location..." : "📍 Use Current GPS Location"}
              </button>
              <div className="form-row-2">
                <div>
                  <label style={{ fontSize: "12px" }}>Latitude</label>
                  <div className="input-wrapper" style={{ marginTop: "4px" }}>
                    <MapPin size={16} />
                    <input type="number" step="any" placeholder="22.5726" value={lat} onChange={(e) => setLat(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "12px" }}>Longitude</label>
                  <div className="input-wrapper" style={{ marginTop: "4px" }}>
                    <MapPin size={16} />
                    <input type="number" step="any" placeholder="88.3639" value={lng} onChange={(e) => setLng(e.target.value)} />
                  </div>
                </div>
              </div>
              {lat && lng && (
                <p className="field-hint" style={{ color: "var(--color-primary-light)" }}>
                  ✅ Location set: {parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}
                </p>
              )}
            </div>

            <button className="primary-button full" type="submit" style={{ marginTop: "4px" }}>
              Next: Regulatory Details <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <form onSubmit={nextStep} className="auth-form">
            <div className="form-section-title">
              <FileText size={16} />
              Clinical Establishment License
            </div>

            <div className="form-row-2">
              <div>
                <label>License Number *</label>
                <div className="input-wrapper" style={{ marginTop: "6px" }}>
                  <FileText size={18} />
                  <input type="text" placeholder="CEL-2024-00123" value={licenseNo} onChange={(e) => setLicenseNo(e.target.value)} required />
                </div>
              </div>
              <div>
                <label>License Certificate</label>
                <div className="file-upload-zone" style={{ marginTop: "6px" }}>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    id="licenseDoc"
                    style={{ display: "none" }}
                    onChange={(e) => setLicenseDocName(e.target.files[0]?.name || "")}
                  />
                  <label htmlFor="licenseDoc" className="file-upload-label">
                    <FileText size={16} />
                    {licenseDocName || "Upload License (.pdf/.jpg)"}
                  </label>
                </div>
              </div>
            </div>

            {/* Pharmacy Toggle */}
            <div className="toggle-section" style={{ marginTop: "16px" }}>
              <div className="toggle-header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Pill size={20} style={{ color: "var(--color-primary-light)" }} />
                  <div>
                    <strong>In-House Pharmacy</strong>
                    <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: 0 }}>
                      Does your facility have an attached pharmacy?
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setHasPharmacy((v) => !v)}
                  style={{ color: hasPharmacy ? "var(--color-primary-light)" : "var(--color-text-muted)" }}
                >
                  {hasPharmacy ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                </button>
              </div>

              {hasPharmacy && (
                <div className="pharmacy-sub-form fade-in">
                  <div className="form-row-2">
                    <div>
                      <label>Drug License No. (Form 20/21) *</label>
                      <div className="input-wrapper" style={{ marginTop: "6px" }}>
                        <Pill size={18} />
                        <input type="text" placeholder="DL-2024-00123" value={drugLicenseNo} onChange={(e) => setDrugLicenseNo(e.target.value)} required={hasPharmacy} />
                      </div>
                    </div>
                    <div>
                      <label>Drug License Document</label>
                      <div className="file-upload-zone" style={{ marginTop: "6px" }}>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.png"
                          id="drugDoc"
                          style={{ display: "none" }}
                          onChange={(e) => setDrugLicenseDocName(e.target.files[0]?.name || "")}
                        />
                        <label htmlFor="drugDoc" className="file-upload-label">
                          <FileText size={16} />
                          {drugLicenseDocName || "Upload Drug License"}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Toggle */}
                  <div className="toggle-section inner-toggle" style={{ marginTop: "16px" }}>
                    <div className="toggle-header">
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Truck size={18} style={{ color: "#60a5fa" }} />
                        <div>
                          <strong>Enable Medicine Delivery</strong>
                          <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: 0 }}>
                            Offer local or courier delivery for prescriptions?
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="toggle-btn"
                        onClick={() => setDeliveryEnabled((v) => !v)}
                        style={{ color: deliveryEnabled ? "#60a5fa" : "var(--color-text-muted)" }}
                      >
                        {deliveryEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                      </button>
                    </div>

                    {deliveryEnabled && (
                      <div className="delivery-settings fade-in">
                        <div>
                          <label>Free Delivery Radius (km)</label>
                          <div className="input-wrapper" style={{ marginTop: "6px" }}>
                            <Truck size={18} />
                            <input type="number" placeholder="2" min="0" step="0.5" value={freeDeliveryRadius} onChange={(e) => setFreeDeliveryRadius(e.target.value)} />
                          </div>
                          <p className="field-hint">Medicine delivery is free within this radius.</p>
                        </div>

                        <div className="toggle-section inner-toggle" style={{ marginTop: "12px" }}>
                          <div className="toggle-header" style={{ padding: "10px 14px" }}>
                            <div>
                              <strong style={{ fontSize: "13px" }}>Express Courier (Out-of-Town)</strong>
                              <p style={{ fontSize: "11px", color: "var(--color-text-secondary)", margin: 0 }}>
                                Enable paid courier for farther deliveries?
                              </p>
                            </div>
                            <button
                              type="button"
                              className="toggle-btn"
                              onClick={() => setCourierEnabled((v) => !v)}
                              style={{ color: courierEnabled ? "#60a5fa" : "var(--color-text-muted)" }}
                            >
                              {courierEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button type="button" className="secondary-button" onClick={prevStep} style={{ flex: 1 }}>
                <ArrowLeft size={16} /> Back
              </button>
              <button className="primary-button" type="submit" style={{ flex: 2 }}>
                Next: Review & Confirm <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: REVIEW ── */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="summary-box">
              <p className="summary-box-title">📋 Facility Registration Summary</p>
              <div className="summary-row"><span>Facility Name</span><strong>{clinicName}</strong></div>
              <div className="summary-row"><span>Email</span><strong>{email}</strong></div>
              <div className="summary-row"><span>Phone</span><strong>{phone}</strong></div>
              <div className="summary-row"><span>Address</span><strong>{address}</strong></div>
              {lat && lng && (
                <div className="summary-row"><span>GPS Location</span><strong>{lat}, {lng}</strong></div>
              )}
              <div className="summary-row"><span>License No.</span><strong>{licenseNo}</strong></div>
              <div className="summary-row">
                <span>In-House Pharmacy</span>
                <strong style={{ color: hasPharmacy ? "var(--color-primary-light)" : "var(--color-text-muted)" }}>
                  {hasPharmacy ? "✅ Yes" : "❌ No"}
                </strong>
              </div>
              {hasPharmacy && (
                <>
                  <div className="summary-row"><span>Drug License No.</span><strong>{drugLicenseNo}</strong></div>
                  <div className="summary-row">
                    <span>Delivery</span>
                    <strong style={{ color: deliveryEnabled ? "#60a5fa" : "var(--color-text-muted)" }}>
                      {deliveryEnabled ? `✅ Yes · ${freeDeliveryRadius}km free radius` : "❌ No delivery"}
                    </strong>
                  </div>
                  {deliveryEnabled && (
                    <div className="summary-row">
                      <span>Express Courier</span>
                      <strong>{courierEnabled ? "✅ Enabled" : "❌ Disabled"}</strong>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="privacy-badge" style={{ background: "rgba(168,85,247,0.1)", borderColor: "rgba(168,85,247,0.3)", color: "#c084fc" }}>
              <CheckCircle2 size={16} />
              <span>Your facility will be publicly listed after admin verification (1–3 business days).</span>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
              <button type="button" className="secondary-button" onClick={prevStep} style={{ flex: 1 }}>
                <ArrowLeft size={16} /> Back
              </button>
              <button className="primary-button" type="submit" disabled={loading} style={{ flex: 2 }}>
                {loading ? "Registering Facility..." : "Complete Registration"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>
          </form>
        )}

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "16px" }}>
          <Link to="/register" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--color-text-secondary)" }}>
            <ArrowLeft size={14} /> Back to role selection
          </Link>
        </div>

        <p className="auth-footer">
          Already registered?
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
