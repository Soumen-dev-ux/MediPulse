import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { registerWithEmail } from "../../firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { registerPatient } from "../../firebase/firestore";

export default function PatientRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await registerWithEmail(form.email, form.password);

      // Write to users collection
      await setDoc(doc(db, "users", user.uid), {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: "patient",
        authProvider: "password",
        createdAt: serverTimestamp(),
      });

      // Write to patients collection (private profile)
      await registerPatient(user.uid, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        city: form.city,
      });

      navigate("/patient");
    } catch (err) {
      console.error(err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page registration-page--patient fade-in">
      <div className="auth-card registration-card registration-card--patient">
        {/* Header */}
        <Link to="/" className="auth-logo">
          <Activity size={24} />
          MediPulse
        </Link>

        <div className="registration-heading">
          <span className="reg-eyebrow">PATIENT REGISTRATION</span>
          <h1>
            Create your patient account
          </h1>
          <p className="auth-subtitle">
            Your data is{" "}
            <span style={{ color: "var(--color-primary-light)", fontWeight: "600" }}>
              100% private
            </span>{" "}
            — never visible to the public.
          </p>
        </div>

        {/* Privacy Shield Badge */}
        <div className="privacy-badge">
          <ShieldCheck size={16} />
          <span>Privacy Protected · Data never shared publicly</span>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Full Name */}
          <div>
            <label>Full Name</label>
            <div className="input-wrapper" style={{ marginTop: "6px" }}>
              <User size={18} />
              <input
                type="text"
                name="name"
                placeholder="Soumen Pore"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label>Email Address</label>
            <div className="input-wrapper" style={{ marginTop: "6px" }}>
              <Mail size={18} />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label>Password</label>
            <div className="input-wrapper" style={{ marginTop: "6px" }}>
              <Lock size={18} />
              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label>Phone Number <span style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>(Private)</span></label>
            <div className="input-wrapper" style={{ marginTop: "6px" }}>
              <Phone size={18} />
              <input
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label>City / Town</label>
            <div className="input-wrapper" style={{ marginTop: "6px" }}>
              <MapPin size={18} />
              <input
                type="text"
                name="city"
                placeholder="Kolkata, Kathmandu..."
                value={form.city}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* What's private */}
          <div className="privacy-details-box">
            <p style={{ fontWeight: "700", fontSize: "12px", marginBottom: "8px", color: "var(--color-text-primary)" }}>
              🔒 What stays private:
            </p>
            {["Phone number", "Email address", "City location", "Medical history"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>
                <CheckCircle2 size={12} style={{ color: "var(--color-primary-light)" }} />
                {item}
              </div>
            ))}
          </div>

          <button className="primary-button full" disabled={loading} style={{ marginTop: "4px" }}>
            {loading ? "Creating Account..." : "Create Patient Account"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "16px" }}>
          <Link
            to="/register"
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            <ArrowLeft size={14} /> Back to role selection
          </Link>
        </div>

        <p className="auth-footer">
          Already have an account?
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
