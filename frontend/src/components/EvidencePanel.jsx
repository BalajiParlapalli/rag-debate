import { useState } from "react";

export default function EvidencePanel({ result }) {
  const [side, setSide] = useState("pro");
  const evidence = side === "pro" ? result.pro?.evidence : result.anti?.evidence;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["pro", "anti"].map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            style={{
              padding: "7px 18px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              background: side === s ? (s === "pro" ? "#1a2a1a" : "#2a1a1a") : "transparent",
              color: side === s ? (s === "pro" ? "#4ade80" : "#f87171") : "#6b6b75",
            }}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(evidence || []).map((chunk, i) => (
          <div key={i} style={{ background: "#18181c", border: "1px solid #2a2a30", borderRadius: 8, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "#a5b4fc", background: "#1e1e3a", padding: "2px 8px", borderRadius: 4 }}>
                {chunk.id}
              </span>
              <span style={{ fontSize: 11, color: "#6b6b75" }}>📄 {chunk.source}</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#9090a0", lineHeight: 1.7 }}>{chunk.text}</p>
          </div>
        ))}
        {(!evidence || evidence.length === 0) && (
          <div style={{ color: "#444", fontSize: 13, padding: 16 }}>No evidence retrieved.</div>
        )}
      </div>
    </div>
  );
}
