import { useState } from "react";
import EvidencePanel from "../components/EvidencePanel";
import Transcript from "../components/Transcript";

const API = "http://localhost:8000";

export default function DebateStudio({ onResult, lastResult }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(lastResult || null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("transcript");

  async function runDebate() {
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API}/debate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult(data);
      onResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const tabStyle = (id) => ({
    padding: "8px 18px", borderRadius: 6, border: "none", cursor: "pointer",
    fontSize: 13, fontWeight: tab === id ? 600 : 400,
    background: tab === id ? "#25252d" : "transparent",
    color: tab === id ? "#a5b4fc" : "#6b6b75",
  });

  return (
    <div>
      <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 600, color: "#e8e6e1" }}>Debate Studio</h1>
      <p style={{ margin: "0 0 28px", color: "#6b6b75", fontSize: 14 }}>Ask a question — Pro and Anti agents argue using your uploaded documents.</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runDebate()}
          placeholder="e.g. Should AI replace college education?"
          style={{ flex: 1, padding: "12px 16px", borderRadius: 8, border: "1px solid #2a2a30", background: "#18181c", color: "#e8e6e1", fontSize: 14, outline: "none" }}
        />
        <button
          onClick={runDebate}
          disabled={loading || !question.trim()}
          style={{ padding: "12px 24px", borderRadius: 8, border: "none", cursor: "pointer", background: loading ? "#2a2a30" : "#6366f1", color: "#fff", fontSize: 14, fontWeight: 600 }}
        >
          {loading ? "Running…" : "Start Debate ↗"}
        </button>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: 8, background: "#2a1a1a", border: "1px solid #5a2020", color: "#f87171", fontSize: 14, marginBottom: 20 }}>
          ⚠ {error}
        </div>
      )}

      {loading && (
        <div style={{ padding: "32px", textAlign: "center", color: "#6b6b75", fontSize: 14 }}>
          <div style={{ marginBottom: 12, fontSize: 24 }}>⚖️</div>
          Retrieving evidence and building arguments…
        </div>
      )}

      {result && (
        <>
          <div style={{ padding: "16px 20px", borderRadius: 10, marginBottom: 20, background: "#1a1f1a", border: "1px solid #2a4a2a" }}>
            <div style={{ fontSize: 12, color: "#4ade80", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              🏆 Winner: {result.verdict?.winner || "—"}
            </div>
            <div style={{ fontSize: 14, color: "#a0c0a0" }}>{result.verdict?.verdict}</div>
          </div>

          <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid #2a2a30", paddingBottom: 8 }}>
            {["transcript", "evidence", "cross-exam"].map((t) => (
              <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === "transcript" && <Transcript result={result} />}
          {tab === "evidence" && <EvidencePanel result={result} />}
          {tab === "cross-exam" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <CrossCard title="Attacks on Pro" items={result.cross_exam?.attack_on_pro} color="#f87171" />
              <CrossCard title="Attacks on Anti" items={result.cross_exam?.attack_on_anti} color="#fb923c" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CrossCard({ title, items = [], color }) {
  return (
    <div style={{ background: "#18181c", border: "1px solid #2a2a30", borderRadius: 10, padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 14 }}>{title}</div>
      {items.map((item, i) => (
        <div key={i} style={{ fontSize: 13, color: "#9090a0", marginBottom: 10, paddingLeft: 12, borderLeft: "2px solid #2a2a30" }}>
          {item}
        </div>
      ))}
      {items.length === 0 && <div style={{ color: "#444", fontSize: 13 }}>No attacks found.</div>}
    </div>
  );
}