import os, shutil, tempfile
import chromadb
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ingest import ingest_pdf
from debate import run_debate

chroma_client = chromadb.PersistentClient(path="./chroma_db")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    path = os.path.join(tempfile.gettempdir(), file.filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return ingest_pdf(path, file.filename)

@app.post("/debate")
async def debate(payload: dict):
    return run_debate(payload.get("question", ""))

@app.get("/doc-count")
def doc_count():
    try:
        col = chroma_client.get_or_create_collection("debate_docs")
        return {"count": col.count()}
    except:
        return {"count": 0}

@app.delete("/clear-docs")
def clear_docs():
    try:
        chroma_client.delete_collection("debate_docs")
        chroma_client.get_or_create_collection("debate_docs")
        return {"status": "cleared"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@app.get("/health")
def health():
    return {"status": "ok"}