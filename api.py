from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import time

# RAG Kütüphaneleri
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import ChatOllama
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

# --- BAŞLANGIÇ AYARLARI (Sadece 1 kere çalışır) ---
print("🚀 NexusAI API Başlatılıyor...")

app = FastAPI(title="NexusAI Engine", version="1.0")

# 1. Modelleri ve Veritabanını Hafızaya Yükle (Global Değişkenler)
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
client = QdrantClient(path="./qdrant_db")
vector_store = QdrantVectorStore(
    client=client,
    collection_name="my_documents",
    embedding=embedding_model,
)
retriever = vector_store.as_retriever(search_kwargs={"k": 3})

import os

# YENİ HALİ:
# Eğer 'OLLAMA_HOST' diye bir çevre değişkeni varsa onu kullan, yoksa varsayılanı kullan.
ollama_host = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

llm = ChatOllama(
    model="llama3.2", 
    temperature=0.3,
    base_url=ollama_host,
    repeat_penalty=1.2,  # <-- SİHİRLİ DOKUNUŞ: Tekrarı cezalandırır
    top_k=50,            # <-- Kelime havuzunu sınırlar (daha mantıklı cümleler)
    top_p=0.9            # <-- Olasılık filtresi
)

# 2. Zinciri (Chain) Hazırla
prompt = ChatPromptTemplate.from_template("""
Sen Türkçe konuşan profesyonel bir yapay zeka asistanısın.
Kurallar:
1. Cevabı MUTLAKA Türkçe ver.
2. Bağlam dışına çıkma.

<Bağlam>
{context}
</Bağlam>

Soru: {input}
""")

question_answer_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

print("✅ Sistem Hazır! İstek bekleniyor...")

# --- API ENDPOINTLERİ ---

# İstek Modeli (Gelen verinin formatı)
class QueryRequest(BaseModel):
    question: str

@app.post("/ask")
def ask_question(request: QueryRequest):
    try:
        start_time = time.time()
        
        # Zinciri çalıştır
        response = rag_chain.invoke({"input": request.question})
        
        duration = time.time() - start_time
        
        # Kaynakları temizle
        sources = []
        for doc in response["context"]:
            sources.append(doc.page_content[:100].replace("\n", " ") + "...")

        return {
            "answer": response["answer"],
            "sources": sources,
            "processing_time": f"{duration:.2f} sn"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"status": "NexusAI Engine is Running 🚀"}