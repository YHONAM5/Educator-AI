import joblib
from sentence_transformers import SentenceTransformer
from chromadb import PersistentClient
from prompts import build_prompt
from llm_client import generate

CHROMA_PATH = "vectorstore/chroma"
EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
TOP_K = 5

# Cargar clasificador y embedder para clasificación
clf_bundle = joblib.load("models/level_clf.joblib")
level_clf = clf_bundle["clf"]
embed_model_name = clf_bundle["embed_model"]
embedder_clf = SentenceTransformer(embed_model_name)

# Embedder para retrieval
embedder_retrieval = SentenceTransformer(EMBED_MODEL)

def classify_level(user_text: str):
    vec = embedder_clf.encode([user_text], normalize_embeddings=True)
    pred = level_clf.predict(vec)[0]
    return pred

def retrieve_context(query: str, k: int = TOP_K):
    client = PersistentClient(path=CHROMA_PATH)
    col = client.get_collection("course_knowledge")
    qvec = embedder_retrieval.encode([query], normalize_embeddings=True)[0]
    res = col.query(query_embeddings=[qvec], n_results=k)
    docs = res.get("documents", [[]])[0]
    metas = res.get("metadatas", [[]])[0]
    
    # Obtener solo los nombres de archivo únicos
    source_files = set()
    for m in metas:
        src = m.get("source", "desconocido")
        source_files.add(src)
    
    # Concatenar documentos para el contexto (usado en el prompt)
    lines = []
    for d, m in zip(docs, metas):
        src = m.get("source", "desconocido")
        lines.append(f"[Fuente: {src}]\n{d}")
    
    context_text = "\n\n---\n\n".join(lines)
    return context_text, list(source_files)

def answer(user_query: str):
    level = classify_level(user_query)
    # CORRECCIÓN: Separar los dos valores que retorna retrieve_context
    context_text, source_files = retrieve_context(user_query, k=TOP_K)
    prompt = build_prompt(user_query, context_text, level)
    reply = generate(prompt)
    
    # CORRECCIÓN: Devolver solo la lista de archivos, no el contexto completo
    return {"level": level, "answer": reply, "used_docs": source_files}

def search_specific_content(query: str, document_filter: str = None, k: int = TOP_K):
    client = PersistentClient(path=CHROMA_PATH)
    col = client.get_collection("course_knowledge")
    
    # Si se especifica un filtro de documento, usamos metadatos
    if document_filter:
        results = col.get(
            where={"source": {"$eq": document_filter}},
            include=["documents", "metadatas"]
        )
        # Filtrar por similitud dentro del documento específico
        qvec = embedder_retrieval.encode([query], normalize_embeddings=True)[0]
        # Calcular similitud manualmente o usar otra estrategia
        # (Esta parte requiere implementación adicional)
        return results
    else:
        # Búsqueda normal
        return retrieve_context(query, k)
def retrieve_context_specific(query: str, document_name: str, k: int = TOP_K):
    client = PersistentClient(path=CHROMA_PATH)
    col = client.get_collection("course_knowledge")
    
    # Primero obtener todos los chunks del documento específico
    all_doc_chunks = col.get(
        where={"source": {"$eq": document_name}},
        include=["documents", "metadatas", "embeddings"]
    )
    
    # Si no hay chunks, retornar vacío
    if not all_doc_chunks['ids']:
        return "", []
    
    # Calcular similitud de la consulta con cada chunk
    qvec = embedder_retrieval.encode([query], normalize_embeddings=True)[0]
    similarities = []
    
    for i, embedding in enumerate(all_doc_chunks['embeddings']):
        sim = np.dot(qvec, embedding) / (np.linalg.norm(qvec) * np.linalg.norm(embedding))
        similarities.append((i, sim))
    
    # Ordenar por similitud y tomar los top K
    similarities.sort(key=lambda x: x[1], reverse=True)
    top_indices = [idx for idx, sim in similarities[:k]]
    
    # Construir contexto con los chunks más similares
    lines = []
    source_files = set()
    for idx in top_indices:
        doc = all_doc_chunks['documents'][idx]
        meta = all_doc_chunks['metadatas'][idx]
        src = meta.get("source", "desconocido")
        lines.append(f"[Fuente: {src}]\n{doc}")
        source_files.add(src)
    
    context_text = "\n\n---\n\n".join(lines)
    return context_text, list(source_files)