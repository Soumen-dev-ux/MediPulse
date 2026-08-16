import { useState } from "react";
import { X, Bot, Send, User, Sparkles, AlertTriangle } from "lucide-react";

export default function AIHealthModal({ isOpen, onClose, onOpenSOS }) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your MediPulse AI Medical Assistant. Describe any symptoms or healthcare questions you have today.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      let reply = "Based on your description, I recommend scheduling a consultation with a General Physician or Cardiologist for a thorough checkup.";
      if (userMsg.toLowerCase().includes("chest pain") || userMsg.toLowerCase().includes("breath") || userMsg.toLowerCase().includes("heart")) {
        reply = "⚠️ Chest discomfort or shortness of breath can be serious! Please sit calmly, avoid exertion, and click Emergency SOS below if pain intensifies.";
      } else if (userMsg.toLowerCase().includes("headache") || userMsg.toLowerCase().includes("fever")) {
        reply = "Stay hydrated and rest in a cool room. If temperature exceeds 101°F for over 24 hours, consider booking a doctor consult.";
      }
      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
      setTyping(false);
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
      display: "flex", justifyContent: "flex-end", backdropFilter: "blur(4px)"
    }}>
      <div className="modal-card fade-in" onClick={(e) => e.stopPropagation()} style={{
        background: "var(--color-bg-secondary)", height: "100%", maxWidth: "450px", width: "100%",
        display: "flex", flexDirection: "column", borderLeft: "1px solid var(--color-border)", boxShadow: "-10px 0 30px rgba(0,0,0,0.5)"
      }}>
        {/* Header */}
        <div style={{ padding: "20px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="stat-icon-wrapper" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", padding: "8px" }}>
              <Bot size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: "700" }}>MediPulse AI Health Assistant</h2>
              <span style={{ fontSize: "11px", color: "var(--color-primary-light)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Sparkles size={11} /> 24/7 Symptom Triage Active
              </span>
            </div>
          </div>
          <button onClick={onClose} className="nav-icon-btn">
            <X size={20} />
          </button>
        </div>

        {/* Message Log */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{
              alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              background: m.sender === "user" ? "var(--color-primary-dark)" : "var(--color-bg-tertiary)",
              color: "var(--color-text)",
              padding: "12px 16px",
              borderRadius: "14px",
              fontSize: "13.5px",
              lineHeight: "1.5"
            }}>
              {m.text}
            </div>
          ))}
          {typing && (
            <div style={{ alignSelf: "flex-start", color: "var(--color-text-secondary)", fontSize: "12px" }}>
              AI is analyzing symptoms...
            </div>
          )}
        </div>

        {/* SOS Emergency Call Trigger */}
        <div style={{ padding: "12px 20px", background: "rgba(239, 68, 68, 0.1)", borderTop: "1px solid rgba(239, 68, 68, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#fca5a5" }}>Having acute severe symptoms?</span>
          <button 
            className="danger-button" 
            style={{ padding: "6px 12px", fontSize: "11px" }}
            onClick={() => { onClose(); onOpenSOS(); }}
          >
            <AlertTriangle size={13} /> Trigger SOS Hotline
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} style={{ padding: "16px", borderTop: "1px solid var(--color-border)", display: "flex", gap: "10px" }}>
          <input 
            type="text" 
            placeholder="Type symptoms (e.g. fever, headache)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ flex: 1, background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "10px 14px", color: "var(--color-text)", fontSize: "13px" }}
          />
          <button type="submit" className="primary-button" style={{ padding: "10px 16px" }}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
