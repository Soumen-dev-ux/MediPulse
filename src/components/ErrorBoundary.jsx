import React from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#090d16", color: "#f8fafc", padding: "20px" }}>
          <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: "16px", padding: "32px", maxWidth: "500px", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
              <AlertTriangle size={32} />
            </div>

            <h1 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "8px" }}>MediPulse Application Notice</h1>
            <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "20px" }}>
              {this.state.error?.message || "An unexpected rendering glitch occurred. Click reload to refresh your session."}
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => window.location.reload()}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "10px", background: "#3b82f6", color: "#fff", border: "none", fontWeight: "600", cursor: "pointer" }}
              >
                <RotateCcw size={16} /> Reload Page
              </button>

              <button
                onClick={() => window.location.href = "/"}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "10px", background: "#1e293b", color: "#f8fafc", border: "1px solid #334155", fontWeight: "600", cursor: "pointer" }}
              >
                <Home size={16} /> Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
