# llm_client.py
import os, requests
import json

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "codellama:7b-instruct")

def generate(prompt: str, temperature=0.4, max_tokens=800):
    # API de Ollama (streaming=false para simplicidad)
    url = f"{OLLAMA_HOST}/api/generate"
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "temperature": temperature,
        "options": {"num_predict": max_tokens}
    }
    # r = requests.post(url, json=payload, timeout=600)
    # r.raise_for_status()
    # data = r.json()
    # return data.get("response", "").strip()
    
    r = requests.post(url, json=payload, timeout=600)
    r.raise_for_status()

    # Procesar cada línea JSON en la respuesta
    full_response = ""
    for line in r.text.splitlines():
        if not line.strip():
            continue
        try:
            data = json.loads(line)
            full_response += data.get("response", "")
        except json.JSONDecodeError:
            continue

    return full_response.strip()