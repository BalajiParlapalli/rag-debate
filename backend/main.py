import os, shutil, tempfile
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ingest import ingest_pdf
from debate import run_debate

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

@app.get("/health")
def health():
    return {"status": "ok"}