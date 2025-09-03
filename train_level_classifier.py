import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, f1_score
from sentence_transformers import SentenceTransformer
import numpy as np
import os

DATA_PATH = "data/labeled/level_samples.csv"
EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
OUT_PATH = "models/level_clf.joblib"

def main():
    # 1) Cargar dataset
    df = pd.read_csv(DATA_PATH)  # columns: text,label
    df = df.dropna(subset=["text", "label"])
    
    # 2) Embeddings (texto -> vector)
    embedder = SentenceTransformer(EMBED_MODEL)
    X = embedder.encode(df["text"].tolist(), batch_size=64, show_progress_bar=True, normalize_embeddings=True)
    y = df["label"].values

    # 3) Train/test split
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # 4) Clasificador ligero y robusto
    clf = LogisticRegression(max_iter=2000, class_weight="balanced")
    clf.fit(Xtr, ytr)

    # 5) Evaluación rápida
    ypred = clf.predict(Xte)
    print(classification_report(yte, ypred, digits=3))
    print("Macro-F1:", f1_score(yte, ypred, average="macro"))

    # 6) Guardar modelo y meta
    os.makedirs("models", exist_ok=True)
    joblib.dump({"clf": clf, "embed_model": EMBED_MODEL}, OUT_PATH)
    print(f"Modelo guardado en: {OUT_PATH}")

if __name__ == "__main__":
    main()