function extractSides(question = "") {
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
  return { forLabel: "Side A", againstLabel: "Side B" };
}

export default function Evaluation({ result }) {
  if (!result) {
    return (
      <div style={{ textAlign: "center", padding: "64px 0", color: "#444", fontSize: 14 }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>📊</div>
        Run a debate first to see evaluation scores.
      </div>
    );
  }

  const { pro_scores = {}, anti_scores = {}, winner, verdict } = result.verdict || {};
  const { forLabel, againstLabel } = extractSides(result.question);
  const metrics = ["groundedness", "evidence_diversity", "contradiction_handling", "persuasiveness"];

  return (
    <div>
      <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 600, color: "#e8e6e1" }}>Evaluation</h1>
      <p style={{ margin: "0 0 28px", color: "#6b6b75", fontSize: 14 }}>Score breakdown for: <em style={{ color: "#a5b4fc" }}>{result.question}</em></p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <ScoreCard title={forLabel} subtitle="Side A" scores={pro_scores} color="#4ade80" border="#2a4a2a" bg="#1a2a1a" metrics={metrics} />
        <ScoreCard title={againstLabel} subtitle="Side B" scores={anti_scores} color="#f87171" border="#4a2a2a" bg="#2a1a1a" metrics={metrics} />
      </div>

      <div style={{ background: "#18181c", border: "1px solid #2a2a30", borderRadius: 10, padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#a5b4fc", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>
          Judge Verdict
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#e8e6e1", marginBottom: 8, textAlign: "center" }}>
          🏆 {winner === "Side A" || winner === "Pro" ? forLabel : winner === "Side B" || winner === "Anti" ? againstLabel : winner}
        </div>
        <div style={{ fontSize: 14, color: "#9090a0", lineHeight: 1.7, textAlign: "center" }}>{verdict}</div>
      </div>
    </div>
  );
}

function ScoreCard({ title, subtitle, scores, color, border, bg, metrics }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</div>
        <div style={{ fontSize: 11, color: "#4a4a5a", background: "#1e1e28", display: "inline-block", padding: "2px 8px", borderRadius: 10, marginTop: 4 }}>{subtitle}</div>
      </div>
      {metrics.map((m) => {
        const val = scores[m] ?? "—";
        const pct = typeof val === "number" ? (val / 10) * 100 : 0;
        return (
          <div key={m} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b6b75", marginBottom: 4 }}>
              <span style={{ textTransform: "capitalize" }}>{m.replace(/_/g, " ")}</span>
              <span style={{ color: "#e8e6e1", fontWeight: 600 }}>{val}/10</span>
            </div>
            <div style={{ height: 4, background: "#2a2a30", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.5s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}