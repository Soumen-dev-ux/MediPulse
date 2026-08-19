import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Phone, Activity, ArrowRight, UserCheck, Stethoscope, ShieldCheck } from "lucide-react";
import { loginWithEmail, loginWithGoogle, sendPhoneOTP, registerWithEmail } from "../firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export default function Login() {
  const navigate = useNavigate();

  const [method, setMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDemoLogin = async (role) => {
    setError("");
    setLoading(true);
    const demoEmail = `${role}@medipulse.org`;
    const demoPassword = "password123";

    try {
      // Try logging in
      const user = await loginWithEmail(demoEmail, demoPassword);
      // Ensure role matches in Firestore
      await setDoc(doc(db, "users", user.uid), { role }, { merge: true });
      navigate("/dashboard");
    } catch (loginErr) {
      // If demo user does not exist yet, automatically register it!
      try {
        const newUser = await registerWithEmail(demoEmail, demoPassword);
        await setDoc(doc(db, "users", newUser.uid), {
          name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
          email: demoEmail,
          phone: "+919876543210",
          role: role,
          authProvider: "demo",
          createdAt: serverTimestamp(),
        });
        navigate("/dashboard");
      } catch (regErr) {
        console.error(regErr);
        setError(`Unable to sign in as demo ${role}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError("Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      await sendPhoneOTP(phone);
      setOtpSent(true);
    } catch (error) {
      console.error(error);
      setError(error.message || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError("");
    setLoading(true);

    try {
      await window.confirmationResult.confirm(otp);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError("Invalid OTP.");
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

        <h1>Welcome back</h1>
        <p className="auth-subtitle">Access your personalized healthcare dashboard.</p>

        {/* Demo Account Switcher */}
        <div style={{ marginBottom: "20px", background: "var(--color-bg-tertiary)", padding: "12px", borderRadius: "12px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px", color: "var(--color-primary-light)", display: "block", marginBottom: "8px" }}>
            FAST DEMO LOGIN (ONE-CLICK ACCESS)
          </span>
          <div className="demo-login-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: "6px" }}>
            <button
              type="button"
              className="secondary-button"
              onClick={() => handleDemoLogin("patient")}
              disabled={loading}
              style={{ padding: "6px 4px", fontSize: "11px", justifyContent: "center" }}
            >
              <UserCheck size={13} /> Patient
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => handleDemoLogin("doctor")}
              disabled={loading}
              style={{ padding: "6px 4px", fontSize: "11px", justifyContent: "center" }}
            >
              <Stethoscope size={13} /> Doctor
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => handleDemoLogin("admin")}
              disabled={loading}
              style={{ padding: "6px 4px", fontSize: "11px", justifyContent: "center" }}
            >
              <ShieldCheck size={13} /> Admin
            </button>
          </div>
        </div>

        <div className="auth-methods">
          <button
            className={method === "email" ? "method active" : "method"}
            onClick={() => setMethod("email")}
          >
            <Mail size={16} />
            Email Sign In
          </button>

          <button
            className={method === "phone" ? "method active" : "method"}
            onClick={() => setMethod("phone")}
          >
            <Phone size={16} />
            Phone OTP
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        {method === "email" && (
          <form onSubmit={handleEmailLogin} className="auth-form">
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="primary-button full" disabled={loading} style={{ marginTop: "8px" }}>
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {method === "phone" && (
          <div className="auth-form">
            <div>
              <label>Phone Number</label>
              <div className="input-wrapper" style={{ marginTop: "6px" }}>
                <Phone size={18} />
                <input
                  type="tel"
                  placeholder="+91XXXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {!otpSent ? (
              <button className="primary-button full" onClick={handleSendOTP} disabled={loading} style={{ marginTop: "8px" }}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            ) : (
              <>
                <div>
                  <label>Enter Verification Code</label>
                  <div className="input-wrapper" style={{ marginTop: "6px" }}>
                    <Lock size={18} />
                    <input
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                </div>

                <button className="primary-button full" onClick={handleVerifyOTP} disabled={loading} style={{ marginTop: "8px" }}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            )}
          </div>
        )}

        <div id="recaptcha-container"></div>

        <div className="divider">
          <span>OR CONTINUE WITH</span>
        </div>

        <button className="google-button" onClick={handleGoogleLogin} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Google
        </button>

        <p className="auth-footer">
          Don't have an account?
          <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}