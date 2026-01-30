from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import time
import os

# RAG Kütüphaneleri
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient, models  # <--- DÜZELTME BURADA: 'models' EKLENDİ
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import ChatOllama
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

# --- BAŞLANGIÇ AYARLARI ---
print("🚀 NexusAI API Başlatılıyor...")

app = FastAPI(title="NexusAI Engine", version="1.0")

# 1. Modelleri ve Veritabanını Hafızaya Yükle
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Qdrant istemcisini başlat
client = QdrantClient(path="qdrant_db")
collection_name = "my_documents"

# --- KOLEKSİYON KONTROLÜ ---
# Eğer koleksiyon yoksa, boş bir tane oluştur (Hata vermemesi için)
if not client.collection_exists(collection_name):
    print(f"⚠️ Uyarı: '{collection_name}' bulunamadı. Boş olarak oluşturuluyor...")
    client.create_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(
            size=384, # all-MiniLM-L6-v2 modeli için boyut 384'tür.
            distance=models.Distance.COSINE
        )
    )

# Vector Store Bağlantısı
vector_store = QdrantVectorStore(
    client=client,
    collection_name=collection_name,
    embedding=embedding_model,
)
retriever = vector_store.as_retriever(search_kwargs={"k": 3})

# LLM Ayarları
ollama_host = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434") 
# Not: Docker içinden localhost'a erişmek için 'host.docker.internal' kullanmak daha güvenlidir.

llm = ChatOllama(
    model="llama3.2", 
    temperature=0.3,
    base_url=ollama_host,
    repeat_penalty=1.2,
    top_k=50,
    top_p=0.9
)

# 2. Zinciri (Chain) Hazırla
prompt = ChatPromptTemplate.from_template("""
Sen Türkçe konuşan profesyonel bir yapay zeka asistanısın.
Kurallar:
1. Cevabı MUTLAKA Türkçe ver.
2. Bağlam dışına çıkma.
3. Eğer bağlamda bilgi yoksa "Bu konuda bilgim yok" de.

<Bağlam>
{context}
</Bağlam>

Soru: {input}
""")

question_answer_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

print("✅ Sistem Hazır! İstek bekleniyor...")

# --- API ENDPOINTLERİ ---

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
        if "context" in response:
            for doc in response["context"]:
                sources.append(doc.page_content[:100].replace("\n", " ") + "...")

        return {
            "answer": response["answer"],
            "sources": sources,
            "processing_time": f"{duration:.2f} sn"
        }
        
    except Exception as e:
        print(f"HATA OLUŞTU: {str(e)}") # Konsola hatayı bas
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"status": "NexusAI Engine is Running 🚀"}