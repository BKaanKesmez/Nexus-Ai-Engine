from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import time
import os

# Tavily ve RAG
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient, models
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv

load_dotenv() # .env dosyasını okumak için

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# --- BAŞLANGIÇ AYARLARI ---
print("🚀 NexusAI Hızlı Mod (Pipeline) Başlatılıyor...")

app = FastAPI(title="NexusAI Fast Engine", version="3.0")

# 1. Veritabanı Ayarları
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
client = QdrantClient(path="qdrant_db")
collection_name = "my_documents"

if not client.collection_exists(collection_name):
    client.create_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE)
    )

vector_store = QdrantVectorStore(
    client=client,
    collection_name=collection_name,
    embedding=embedding_model,
)

# 2. Araçlar (Doğrudan Çağıracağız)
tavily_tool = TavilySearchResults(max_results=3) # En iyi 3 sonucu getir

# 3. LLM (Beyin)
groq_api_key = os.getenv("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")

if not groq_api_key:
    raise ValueError("GROQ_API_KEY bulunamadı! Lütfen .env dosyasına veya Docker ortamına ekleyin.")

llm = ChatGroq(
    groq_api_key=groq_api_key,
    model_name="llama-3.3-70b-versatile", # Veya "llama-3.1-8b-instant" (Daha hızlı)
    temperature=0.3
)

# 4. Prompt Şablonu (Düşünme adımları yok, direkt cevap var)
template = """
Sen yardımsever bir asistansın. Aşağıdaki bağlamı kullanarak kullanıcının sorusunu cevapla.

<Bulunan Bilgiler>
{context}
</Bulunan Bilgiler>

Kurallar:
1. Sadece verilen bilgileri kullan.
2. Cevabı MUTLAKA Türkçe ver.
3. Kısa ve net ol.

Soru: {question}
"""
prompt = ChatPromptTemplate.from_template(template)
chain = prompt | llm | StrOutputParser()

# --- YARDIMCI FONKSİYONLAR ---

def get_combined_context(query: str):
    """
    Hem hafızayı hem interneti aynı anda tarar ve birleştirir.
    Bu kısım 'Ajan'ın yaptığı işi manuel ve hızlı yapar.
    """
    context_parts = []
    
    # A) Hafıza Araması (RAG)
    try:
        docs = vector_store.similarity_search(query, k=2)
        if docs:
            memory_text = "\n".join([f"- [Hafıza]: {d.page_content}" for d in docs])
            context_parts.append(memory_text)
    except Exception as e:
        print(f"RAG Hatası: {e}")

    # B) İnternet Araması (Tavily) - Her zaman ara (veya RAG boşsa ara)
    # Hız için: Her sorguda internete de bakıyoruz ki güncel olsun.
    try:
        web_results = tavily_tool.invoke(query)
        # Tavily bazen liste bazen string döner, kontrol edelim
        if isinstance(web_results, list):
            web_text = "\n".join([f"- [İnternet]: {res.get('content', '')}" for res in web_results])
            context_parts.append(web_text)
        else:
             context_parts.append(f"- [İnternet]: {str(web_results)}")
             
    except Exception as e:
        print(f"Tavily Hatası: {e}")

    return "\n\n".join(context_parts)

# --- API ENDPOINTLERİ ---

class QueryRequest(BaseModel):
    question: str

@app.post("/ask")
def ask_question(request: QueryRequest):
    try:
        start_time = time.time()
        
        # 1. ADIM: Bilgi Topla (Düşünmek yok, direkt topla)
        context_data = get_combined_context(request.question)
        
        if not context_data.strip():
            context_data = "Herhangi bir bilgi bulunamadı."

        # 2. ADIM: Cevabı Üret (Tek LLM çağrısı)
        answer = chain.invoke({"context": context_data, "question": request.question})
        
        duration = time.time() - start_time

        return {
            "answer": answer,
            "sources": ["Hybrid Search (Memory + Web)"],
            "processing_time": f"{duration:.2f} sn"
        }
        
    except Exception as e:
        print(f"HATA: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"status": "NexusAI Fast Mode is Active ⚡"}