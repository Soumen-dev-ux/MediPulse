import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Activity, ArrowRight, ShieldCheck, Stethoscope, UserCheck } from "lucide-react";
import { registerWithEmail } from "../firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await registerWithEmail(email, password);

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        phone: "",
        role: role,
        authProvider: "password",
        createdAt: serverTimestamp(),
      });

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError(error.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <Activity size={26} />
          MediPulse
        </Link>

        <h1>Create your account</h1>
        <p className="auth-subtitle">Start managing your healthcare smarter.</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div>
            <label>Full Name</label>
            <div className="input-wrapper" style={{ marginTop: "6px" }}>
              <User size={18} />
              <input
                type="text"
                placeholder="Soumen Pore"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label>Email Address</label>
            <div className="input-wrapper" style={{ marginTop: "6px" }}>
              <Mail size={18} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label>Password</label>
            <div className="input-wrapper" style={{ marginTop: "6px" }}>
              <Lock size={18} />
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>

          <div>
            <label>Select Account Role</label>
            <div className="auth-methods" style={{ marginTop: "6px", gridTemplateColumns: "1fr 1fr 1fr" }}>
              <button
                type="button"
                className={role === "patient" ? "method active" : "method"}
                onClick={() => setRole("patient")}
                style={{ padding: "8px 6px", fontSize: "12px" }}
              >
                <UserCheck size={14} />
                Patient
              </button>
              <button
                type="button"
                className={role === "doctor" ? "method active" : "method"}
                onClick={() => setRole("doctor")}
                style={{ padding: "8px 6px", fontSize: "12px" }}
              >
                <Stethoscope size={14} />
                Doctor
              </button>
              <button
                type="button"
                className={role === "admin" ? "method active" : "method"}
                onClick={() => setRole("admin")}
                style={{ padding: "8px 6px", fontSize: "12px" }}
              >
                <ShieldCheck size={14} />
                Admin
              </button>
            </div>
          </div>

          <button className="primary-button full" disabled={loading} style={{ marginTop: "12px" }}>
            {loading ? "Creating Account..." : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}