import fitz  # PyMuPDF
import chromadb
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter

embedder = SentenceTransformer("all-MiniLM-L6-v2")
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection("debate_docs")

def ingest_pdf(file_path: str, doc_name: str):
    # Extract text from PDF
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()

    # Split into chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(text)

    if not chunks:
        return {"error": "No text found in PDF"}

    # Embed chunks
    embeddings = embedder.encode(chunks).tolist()
    ids = [f"{doc_name}_chunk_{i}" for i in range(len(chunks))]

    # Store in ChromaDB
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=ids,
        metadatas=[{"source": doc_name, "chunk_index": i} for i in range(len(chunks))]
    )

    return {"doc_name": doc_name, "chunks_stored": len(chunks), "status": "ingested"}