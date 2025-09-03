# app.py
from fastapi import FastAPI
from pydantic import BaseModel
from rag_pipeline import classify_level, retrieve_context, answer, retrieve_context_specific
from prompts import build_prompt
from llm_client import generate

app = FastAPI(title="MentorFlex AI Local")

class Query(BaseModel):
    text: str

@app.post("/classify-level")
def classify(q: Query):
    lvl = classify_level(q.text)
    return {"level": lvl}

@app.post("/ask")
def ask(q: Query):
    result = answer(q.text)
    return result

@app.post("/ask-specific")
def ask_specific(q: Query, document: str = None):
    if document:
        # Búsqueda específica en un documento
        context_text, source_files = retrieve_context_specific(q.text, document)
    else:
        # Búsqueda normal
        context_text, source_files = retrieve_context(q.text)
    
    level = classify_level(q.text)
    prompt = build_prompt(q.text, context_text, level)
    reply = generate(prompt)
    return {"level": level, "answer": reply, "used_docs": source_files}
