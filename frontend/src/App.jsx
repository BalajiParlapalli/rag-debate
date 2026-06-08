import { useState } from "react";
import DebateStudio from "./pages/DebateStudio";
import DocumentLibrary from "./pages/DocumentLibrary";
import Evaluation from "./pages/Evaluation";

const NAV = [
  { id: "debate", label: "Debate Studio", icon: "⚖️" },
  { id: "docs", label: "Documents", icon: "📁" },
  { id: "eval", label: "Evaluation", icon: "📊" },
];

export default function App() {
  const [page, setPage] = useState("debate");
  const [lastResult, setLastResult] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'IBM Plex Sans', sans-serif", background: "#0f0f11", color: "#e8e6e1" }}>
      <nav style={{ width: 200, background: "#18181c", borderRight: "1px solid #2a2a30", padding: "24px 0", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ padding: "0 20px 24px", fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", color: "#6b6b75", textTransform: "uppercase" }}>
          RAG Debate
        </div>
        {NAV.map((n) => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            margin: "0 8px", padding: "10px 14px", borderRadius: 8, border: "none",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
            fontSize: 14, fontWeight: page === n.id ? 600 : 400,
            background: page === n.id ? "#25252d" : "transparent",
            color: page === n.id ? "#a5b4fc" : "#9090a0", transition: "all 0.15s",
          }}>
            <span>{n.icon}</span>{n.label}
          </button>
        ))}
        {/* Doc count badge in sidebar */}
        {uploadedDocs.length > 0 && (
          <div style={{ margin: "8px 16px 0", padding: "8px 12px", borderRadius: 8, background: "#1e1e2a", border: "1px solid #2a2a40", fontSize: 12, color: "#a5b4fc" }}>
            📄 {uploadedDocs.length} doc{uploadedDocs.length > 1 ? "s" : ""} indexed
          </div>
        )}
      </nav>
      <main style={{ flex: 1, overflow: "auto", padding: "32px" }}>
{page === "debate" && <DebateStudio onResult={setLastResult} lastResult={lastResult} hasDocuments={uploadedDocs.length > 0} />}        {page === "docs" && <DocumentLibrary docs={uploadedDocs} onUpload={(doc) => setUploadedDocs((prev) => [...prev, doc])} />}
        {page === "eval" && <Evaluation result={lastResult} />}
      </main>
    </div>
  );
}
