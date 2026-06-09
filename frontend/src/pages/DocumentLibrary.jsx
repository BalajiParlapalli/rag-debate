import { useState, useEffect } from "react";

const API = "http://localhost:8000";

export default function DocumentLibrary({ docs, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dbCount, setDbCount] = useState(0);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetch(`${API}/doc-count`)
      .then((r) => r.json())
      .then((d) => setDbCount(d.count))
      .catch(() => {});
  }, [docs]);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) { setError("Only PDF files supported."); return; }
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API}/upload`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      onUpload({ name: file.name, chunks: data.chunks_indexed });
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleClear() {
    if (!window.confirm("Clear all indexed documents? This cannot be undone.")) return;
    setClearing(true);
    try {
      await fetch(`${API}/clear-docs`, { method: "DELETE" });
      setDbCount(0);
    } catch (e) {
      setError("Failed to clear documents.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <div>
      <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 600, color: "#e8e6e1" }}>Document Library</h1>
      <p style={{ margin: "0 0 28px", color: "#6b6b75", fontSize: 14 }}>
        Upload PDFs to build your debate corpus. Debates without documents use general knowledge.
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
        <label style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "12px 20px", borderRadius: 8, border: "1px dashed #3a3a44",
          cursor: uploading ? "not-allowed" : "pointer", color: uploading ? "#444" : "#a5b4fc", fontSize: 14,
        }}>
          <span>📤</span>
          {uploading ? "Uploading & indexing…" : "Upload PDF"}
          <input type="file" accept=".pdf" onChange={handleUpload} style={{ display: "none" }} disabled={uploading} />
        </label>

        {dbCount > 0 && (
          <button
            onClick={handleClear}
            disabled={clearing}
            style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid #4a2a2a", background: "transparent", color: "#f87171", fontSize: 13, cursor: "pointer" }}
          >
            {clearing ? "Clearing…" : "🗑 Clear all docs"}
          </button>
        )}

        <span style={{ fontSize: 12, color: "#6b6b75", marginLeft: "auto" }}>
          {dbCount > 0 ? `${dbCount} chunks in database` : "No documents indexed"}
        </span>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: 8, background: "#2a1a1a", border: "1px solid #5a2020", color: "#f87171", fontSize: 14, marginBottom: 20 }}>
          ⚠ {error}
        </div>
      )}

      {docs.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {docs.map((doc, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "#18181c", border: "1px solid #2a2a30", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>📄</span>
                <div>
                  <div style={{ fontSize: 14, color: "#e8e6e1", fontWeight: 500 }}>{doc.name}</div>
                  <div style={{ fontSize: 12, color: "#6b6b75" }}>Indexed this session ✓</div>
                </div>
              </div>
              <span style={{ fontSize: 12, background: "#1e1e3a", color: "#a5b4fc", padding: "4px 10px", borderRadius: 20 }}>
                {doc.chunks} chunks
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#444", fontSize: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📂</div>
          {dbCount > 0
            ? `${dbCount} chunks indexed from a previous session. Upload more or clear to start fresh.`
            : "No documents yet. Upload PDFs to get started, or just run a debate without any."}
        </div>
      )}
    </div>
  );
}