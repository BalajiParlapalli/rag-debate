import chromadb
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection("debate_docs")

def retrieve(query: str, stance: str, k: int = 6):
    stance_query = f"{stance} perspective: {query}"
    embedding = model.encode([stance_query]).tolist()
    results = collection.query(query_embeddings=embedding, n_results=k)

    chunks = []
    for i, doc in enumerate(results["documents"][0]):
        chunks.append({
            "id": results["ids"][0][i],
            "text": doc,
            "source": results["metadatas"][0][i].get("source", "unknown"),
        })
    return chunks