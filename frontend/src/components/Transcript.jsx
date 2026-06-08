export default function Transcript({ result }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ArgBlock label="PRO" color="#4ade80" bg="#1a2a1a" border="#2a4a2a" text={result.pro?.argument} />
      <ArgBlock label="ANTI" color="#f87171" bg="#2a1a1a" border="#4a2a2a" text={result.anti?.argument} />
    </div>
  );
}

function ArgBlock({ label, color, bg, border, text }) {
  const highlighted = highlightCitations(text || "No argument generated.");
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>
        {label}
      </div>
      <div
        style={{ fontSize: 14, color: "#c8c5c0", lineHeight: 1.8, whiteSpace: "pre-wrap" }}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  );
}

function highlightCitations(text) {
  return text.replace(/\[([^\]]+)\]/g, (match) => (
    `<span style="background:#1e1e3a;color:#a5b4fc;padding:1px 6px;border-radius:4px;font-size:12px;font-family:monospace">${match}</span>`
  ));
}
