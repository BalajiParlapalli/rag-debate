export default function Transcript({ result }) {
  const question = result.question || "";
  const { forLabel, againstLabel } = extractSides(question);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ArgBlock
        label={forLabel}
        sublabel="Side A"
        color="#4ade80"
        bg="#1a2a1a"
        border="#2a4a2a"
        text={result.pro?.argument}
      />
      <ArgBlock
        label={againstLabel}
        sublabel="Side B"
        color="#f87171"
        bg="#2a1a1a"
        border="#4a2a2a"
        text={result.anti?.argument}
      />
    </div>
  );
}

function extractSides(question) {
  const q = question.trim();
  for (const sep of [" vs ", " versus ", " or "]) {
    const idx = q.toLowerCase().indexOf(sep);
    if (idx !== -1) {
      return {
        forLabel: q.slice(0, idx).trim(),
        againstLabel: q.slice(idx + sep.length).trim(),
      };
    }
  }
  return { forLabel: "For", againstLabel: "Against" };
}

function ArgBlock({ label, sublabel, color, bg, border, text }) {
  const highlighted = highlightCitations(text || "No argument generated.");
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </span>
        <span style={{ fontSize: 11, color: "#4a4a5a", background: "#1e1e28", padding: "2px 8px", borderRadius: 10 }}>
          {sublabel}
        </span>
      </div>
      <div
        style={{ fontSize: 14, color: "#c8c5c0", lineHeight: 1.9, whiteSpace: "pre-wrap" }}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  );
}

function highlightCitations(text) {
  return text.replace(/\[([^\]]+)\]/g, (match, inner) => {
    const short = inner.length > 22 ? inner.slice(0, 22) + "…" : inner;
    return `<span title="${inner}" style="display:inline-block;background:#1e1e3a;color:#818cf8;padding:1px 7px;border-radius:4px;font-size:11px;font-family:monospace;cursor:default;border:1px solid #2d2d5a">[${short}]</span>`;
  });
}