# inspect_chroma_improved.py
import chromadb
from chromadb import PersistentClient

def inspect_chroma_db():
    # Conectar a la base de datos Chroma
    client = PersistentClient(path="vectorstore/chroma")
    collection = client.get_collection("course_knowledge")
    
    # Obtener todos los documentos con sus metadatos
    results = collection.get(include=["documents", "metadatas"])
    
    print(f"Total de chunks en la base de datos: {len(results['ids'])}\n")
    
    # Agrupar chunks por archivo fuente
    chunks_by_source = {}
    for doc, metadata in zip(results['documents'], results['metadatas']):
        source = metadata.get('source', 'desconocido')
        if source not in chunks_by_source:
            chunks_by_source[source] = []
        chunks_by_source[source].append(doc)
    
    # Mostrar archivos con números
    sources_list = list(chunks_by_source.keys())
    print("📁 Archivos disponibles:")
    for i, source in enumerate(sources_list, 1):
        print(f"{i}. {source} ({len(chunks_by_source[source])} chunks)")
    
    print("-" * 80)
    
    # Opción para ver chunks específicos
    while True:
        print("\n¿Quieres ver chunks específicos?")
        print("1. Ver todos los chunks de un archivo (por número)")
        print("2. Ver un chunk específico por su número global")
        print("3. Salir")
        
        choice = input("Selecciona una opción (1-3): ")
        
        if choice == "1":
            try:
                file_num = int(input(f"Introduce el número del archivo (1-{len(sources_list)}): ")) - 1
                if 0 <= file_num < len(sources_list):
                    source_name = sources_list[file_num]
                    print(f"\nChunks del archivo {source_name}:")
                    for i, chunk in enumerate(chunks_by_source[source_name]):
                        print(f"\n--- Chunk {i+1} ---")
                        print(chunk)
                        print("-" * 50)
                else:
                    print("Número de archivo inválido.")
            except ValueError:
                print("Por favor introduce un número válido.")
                
        elif choice == "2":
            try:
                chunk_id = int(input(f"Introduce el número de chunk (1-{len(results['documents'])}): ")) - 1
                if 0 <= chunk_id < len(results['documents']):
                    print(f"\n--- Chunk {chunk_id+1} ---")
                    print(f"Fuente: {results['metadatas'][chunk_id].get('source', 'desconocido')}")
                    print(results['documents'][chunk_id])
                else:
                    print("Número de chunk inválido.")
            except ValueError:
                print("Por favor introduce un número válido.")
                
        elif choice == "3":
            break
            
        else:
            print("Opción no válida.")

if __name__ == "__main__":
    inspect_chroma_db()