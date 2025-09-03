import os, glob
from pypdf import PdfReader
from chromadb import PersistentClient
from sentence_transformers import SentenceTransformer
from uuid import uuid4
import traceback

CHROMA_PATH = "vectorstore/chroma"
EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
CHUNK_SIZE = 800
CHUNK_OVERLAP = 200  # Reducido para evitar problemas

def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    """Divide el texto en chunks con superposición, corrigiendo el bucle infinito"""
    chunks = []
    start = 0
    end = len(text)
    
    while start < end:
        chunk_end = min(start + chunk_size, end)
        chunks.append(text[start:chunk_end])
        
        # Avanzar, asegurando que no nos quedemos atrapados
        start = start + chunk_size - overlap
        
        # Prevenir bucle infinito si overlap es mayor o igual que chunk_size
        if start <= chunk_end - chunk_size:
            break
            
    return chunks

def read_pdf(path):
    reader = PdfReader(path)
    return "\n".join(page.extract_text() or "" for page in reader.pages)

def read_text_file(path):
    encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252', 'utf-16']
    for encoding in encodings:
        try:
            with open(path, 'r', encoding=encoding) as f:
                return f.read()
        except (UnicodeDecodeError, UnicodeError):
            continue
    
    # Último intento
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    except Exception as e:
        print(f"Error crítico leyendo {path}: {e}")
        return ""

def main():
    os.makedirs(CHROMA_PATH, exist_ok=True)
    client = PersistentClient(path=CHROMA_PATH)
    collection = client.get_or_create_collection("course_knowledge")
    embedder = SentenceTransformer(EMBED_MODEL)

    files = glob.glob("data/raw/**/*.pdf", recursive=True)
    files += glob.glob("data/raw/**/*.md", recursive=True)
    files += glob.glob("data/raw/**/*.txt", recursive=True)

    print(f"Encontrados {len(files)} archivos para procesar")
    
    docs, metadatas, ids = [], [], []
    
    for fp in files:
        if not os.path.exists(fp):
            print(f"Archivo no encontrado: {fp}")
            continue
            
        try:
            print(f"Procesando: {fp}")
            
            if fp.lower().endswith(".pdf"):
                text = read_pdf(fp)
            else:
                text = read_text_file(fp)
            
            if not text or not text.strip():
                print(f"Archivo vacío o sin texto: {fp}")
                continue
                
            chunks = chunk_text(text)
            print(f"Generados {len(chunks)} chunks")
            
            # for i, ch in enumerate(chunks):
            #     doc_id = f"{os.path.basename(fp)}_chunk_{i}"
            #     docs.append(ch)
            #     metadatas.append({"source": fp, "chunk_id": i})
            #     ids.append(doc_id)
            for i, ch in enumerate(chunk_text(text)):
                doc_id = str(uuid4())
                docs.append(ch)
                # Agregar metadatos más detallados
                metadatas.append({
                    "source": fp,
                    "chunk_number": i+1,
                    "total_chunks": len(chunks),
                    "document_type": "libro" if "LIB" in fp else "apunte"
                })
                ids.append(doc_id)
                
        except Exception as e:
            print(f"Error procesando {fp}: {e}")
            traceback.print_exc()
            continue

    if docs:
        print(f"Generando embeddings para {len(docs)} chunks...")
        embeddings = embedder.encode(docs, batch_size=32, show_progress_bar=True, normalize_embeddings=True)
        collection.add(documents=docs, metadatas=metadatas, ids=ids, embeddings=embeddings)
        print(f"Ingeridos {len(docs)} chunks en Chroma.")
    else:
        print("No se encontraron documentos válidos para procesar.")

if __name__ == "__main__":
    main()