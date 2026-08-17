import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileText,
  Stethoscope,
  GraduationCap,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { registerWithEmail } from "../../firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { registerDoctor } from "../../firebase/firestore";

const TOTAL_STEPS = 3;

export default function DoctorRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");

  // Step 2 fields
  const [medicalRegNo, setMedicalRegNo] = useState("");
  const [medicalRegDocName, setMedicalRegDocName] = useState("");
  const [ugDegree, setUgDegree] = useState("");
  const [ugPassingYear, setUgPassingYear] = useState("");
  const [ugCollegeName, setUgCollegeName] = useState("");
  const [ugDocName, setUgDocName] = useState("");
  const [pgDegree, setPgDegree] = useState("");
  const [pgSpecialization, setPgSpecialization] = useState("");
  const [pgDocName, setPgDocName] = useState("");

  // Step 3 fields
  const [experience, setExperience] = useState("");
  const [consultationFee, setConsultationFee] = useState("");

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
        name,
        email,
        phone,
        role: "doctor",
        authProvider: "password",
        createdAt: serverTimestamp(),
      });

      await registerDoctor(user.uid, {
        name,
        email,
        phone,
        clinicAddress,
        medicalRegNo,
        medicalRegDocName,
        ugDegree,
        ugPassingYear,
        ugCollegeName,
        ugDocName,
        pgDegree: pgDegree || null,
        pgSpecialization: pgSpecialization || null,
        pgDocName: pgDocName || null,
        experience: parseInt(experience) || 0,
        consultationFee: parseInt(consultationFee) || 0,
      });

      navigate("/doctor");
    } catch (err) {
      console.error(err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in" style={{ padding: "40px 20px" }}>
      <div className="auth-card" style={{ maxWidth: "560px" }}>
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
                {s === 1 ? "Basic Info" : s === 2 ? "Credentials" : "Experience"}
              </span>
              {s < 3 && <ChevronRight size={14} className="step-arrow" />}
            </div>
          ))}
        </div>

        {/* Heading */}
        <div style={{ marginBottom: "8px" }}>
          <span className="reg-eyebrow">DOCTOR REGISTRATION · STEP {step} OF {TOTAL_STEPS}</span>
          <h1 style={{ fontSize: "24px", fontWeight: "800", marginTop: "6px" }}>
            {step === 1 && "Basic Information"}
            {step === 2 && "Professional Credentials"}
            {step === 3 && "Experience & Consultation Fee"}
          </h1>
          <p className="auth-subtitle">
            {step === 1 && "Your contact details and current clinic location."}
            {step === 2 && "Medical registration and academic qualifications."}
            {step === 3 && "Set your availability and consultation pricing."}
          </p>
        </div>

        {error && <div className="error-box">{error}</div>}

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <form onSubmit={nextStep} className="auth-form">
            <div>
              <label>Full Name</label>
              <div className="input-wrapper" style={{ marginTop: "6px" }}>
                <User size={18} />
                <input type="text" placeholder="Dr. Soumen Pore" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>

            <div>
              <label>Email Address</label>
              <div className="input-wrapper" style={{ marginTop: "6px" }}>
                <Mail size={18} />
                <input type="email" placeholder="doctor@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div>
              <label>Password</label>
              <div className="input-wrapper" style={{ marginTop: "6px" }}>
                <Lock size={18} />
                <input type="password" placeholder="Minimum 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
              </div>
            </div>

            <div>
              <label>
                Public Contact Phone{" "}
                <span className="public-tag">PUBLIC ✅</span>
              </label>
              <div className="input-wrapper" style={{ marginTop: "6px" }}>
                <Phone size={18} />
                <input type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <p className="field-hint">Patients can call you directly. Shown in the healthcare directory.</p>
            </div>

            <div>
              <label>Current Clinic Address</label>
              <div className="input-wrapper" style={{ marginTop: "6px" }}>
                <MapPin size={18} />
                <input type="text" placeholder="123 Medical Park, Block A, Kolkata" value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} required />
              </div>
            </div>

            <button className="primary-button full" type="submit" style={{ marginTop: "4px" }}>
              Next: Professional Credentials <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <form onSubmit={nextStep} className="auth-form">
            <div className="form-section-title">
              <Stethoscope size={16} />
              Medical Registration
            </div>

            <div className="form-row-2">
              <div>
                <label>Medical Registration No. *</label>
                <div className="input-wrapper" style={{ marginTop: "6px" }}>
                  <FileText size={18} />
                  <input type="text" placeholder="NMC-12345 / MCI-00001" value={medicalRegNo} onChange={(e) => setMedicalRegNo(e.target.value)} required />
                </div>
              </div>
              <div>
                <label>Registration Certificate</label>
                <div className="file-upload-zone" style={{ marginTop: "6px" }}>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    style={{ display: "none" }}
                    id="medRegDoc"
                    onChange={(e) => setMedicalRegDocName(e.target.files[0]?.name || "")}
                  />
                  <label htmlFor="medRegDoc" className="file-upload-label">
                    <FileText size={16} />
                    {medicalRegDocName || "Upload Certificate (.pdf/.jpg)"}
                  </label>
                </div>
              </div>
            </div>

            <div className="form-section-title" style={{ marginTop: "16px" }}>
              <GraduationCap size={16} />
              UG Degree Details *
            </div>

            <div className="form-row-2">
              <div>
                <label>Degree Name *</label>
                <div className="input-wrapper" style={{ marginTop: "6px" }}>
                  <GraduationCap size={18} />
                  <input type="text" placeholder="MBBS / BDS / BAMS" value={ugDegree} onChange={(e) => setUgDegree(e.target.value)} required />
                </div>
              </div>
              <div>
                <label>Passing Year *</label>
                <div className="input-wrapper" style={{ marginTop: "6px" }}>
                  <FileText size={18} />
                  <input type="number" placeholder="2015" min="1970" max={new Date().getFullYear()} value={ugPassingYear} onChange={(e) => setUgPassingYear(e.target.value)} required />
                </div>
              </div>
            </div>

            <div>
              <label>College Name *</label>
              <div className="input-wrapper" style={{ marginTop: "6px" }}>
                <MapPin size={18} />
                <input type="text" placeholder="AIIMS Delhi / Medical College & Hospital" value={ugCollegeName} onChange={(e) => setUgCollegeName(e.target.value)} required />
              </div>
            </div>

            <div>
              <label>UG Degree Certificate</label>
              <div className="file-upload-zone" style={{ marginTop: "6px" }}>
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  style={{ display: "none" }}
                  id="ugDoc"
                  onChange={(e) => setUgDocName(e.target.files[0]?.name || "")}
                />
                <label htmlFor="ugDoc" className="file-upload-label">
                  <FileText size={16} />
                  {ugDocName || "Upload UG Degree Certificate (.pdf/.jpg)"}
                </label>
              </div>
            </div>

            <div className="form-section-title" style={{ marginTop: "16px" }}>
              <GraduationCap size={16} />
              PG Degree Details <span style={{ fontWeight: "400", color: "var(--color-text-muted)", fontSize: "12px" }}>(Optional)</span>
            </div>

            <div className="form-row-2">
              <div>
                <label>PG Degree</label>
                <div className="input-wrapper" style={{ marginTop: "6px" }}>
                  <GraduationCap size={18} />
                  <input type="text" placeholder="MD / MS / DNB / DM" value={pgDegree} onChange={(e) => setPgDegree(e.target.value)} />
                </div>
              </div>
              <div>
                <label>Specialization</label>
                <div className="input-wrapper" style={{ marginTop: "6px" }}>
                  <Stethoscope size={18} />
                  <input type="text" placeholder="Cardiology / Orthopedics..." value={pgSpecialization} onChange={(e) => setPgSpecialization(e.target.value)} />
                </div>
              </div>
            </div>

            {pgDegree && (
              <div>
                <label>PG Degree Certificate</label>
                <div className="file-upload-zone" style={{ marginTop: "6px" }}>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    style={{ display: "none" }}
                    id="pgDoc"
                    onChange={(e) => setPgDocName(e.target.files[0]?.name || "")}
                  />
                  <label htmlFor="pgDoc" className="file-upload-label">
                    <FileText size={16} />
                    {pgDocName || "Upload PG Certificate (.pdf/.jpg)"}
                  </label>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
              <button type="button" className="secondary-button" onClick={prevStep} style={{ flex: 1 }}>
                <ArrowLeft size={16} /> Back
              </button>
              <button className="primary-button" type="submit" style={{ flex: 2 }}>
                Next: Experience & Fee <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row-2">
              <div>
                <label>Years of Experience *</label>
                <div className="input-wrapper" style={{ marginTop: "6px" }}>
                  <Stethoscope size={18} />
                  <input type="number" placeholder="e.g. 10" min="0" max="60" value={experience} onChange={(e) => setExperience(e.target.value)} required />
                </div>
              </div>
              <div>
                <label>Consultation Fee (NPR) *</label>
                <div className="input-wrapper" style={{ marginTop: "6px" }}>
                  <DollarSign size={18} />
                  <input type="number" placeholder="e.g. 500" min="0" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} required />
                </div>
              </div>
            </div>

            {/* Summary Review */}
            <div className="summary-box">
              <p className="summary-box-title">📋 Registration Summary</p>
              <div className="summary-row"><span>Name</span><strong>{name}</strong></div>
              <div className="summary-row"><span>Email</span><strong>{email}</strong></div>
              <div className="summary-row"><span>Phone</span><strong>{phone}</strong></div>
              <div className="summary-row"><span>Clinic</span><strong>{clinicAddress}</strong></div>
              <div className="summary-row"><span>Reg. No.</span><strong>{medicalRegNo}</strong></div>
              <div className="summary-row"><span>UG Degree</span><strong>{ugDegree} ({ugPassingYear})</strong></div>
              {pgDegree && <div className="summary-row"><span>PG Degree</span><strong>{pgDegree} — {pgSpecialization}</strong></div>}
            </div>

            <div className="privacy-badge" style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.3)", color: "#60a5fa" }}>
              <CheckCircle2 size={16} />
              <span>Your profile will be publicly listed after admin verification.</span>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
              <button type="button" className="secondary-button" onClick={prevStep} style={{ flex: 1 }}>
                <ArrowLeft size={16} /> Back
              </button>
              <button className="primary-button" type="submit" disabled={loading} style={{ flex: 2 }}>
                {loading ? "Submitting..." : "Submit Doctor Registration"}
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
