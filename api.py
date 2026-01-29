from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import time
import os

# Gerekli Kütüphaneler
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import ChatOllama
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_classic.tools.retriever import create_retriever_tool
from langchain.agents import create_react_agent, AgentExecutor # <-- DÜZELTME BURADA
from langchain_core.prompts import PromptTemplate # <-- Prompt'u kendimiz tanımlayacağız

print("🚀 NexusAI Agent Başlatılıyor (Web Search Aktif)...")

app = FastAPI(title="NexusAI Agent", version="2.0")

# --- 1. AYARLAR ---
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
client = QdrantClient(path="./qdrant_db")
vector_store = QdrantVectorStore(
    client=client,
    collection_name="my_documents",
    embedding=embedding_model,
)
retriever = vector_store.as_retriever(search_kwargs={"k": 3})

# --- 2. ARAÇLAR (TOOLS) ---
retriever_tool = create_retriever_tool(
    retriever,
    "pdf_knowledge_base",
    "Kullanıcının yüklediği özel belgelerde veya PDF notlarında arama yapar. Öncelikle bunu kullan."
)

search_tool = DuckDuckGoSearchRun() 

tools = [retriever_tool, search_tool]

# --- 3. BEYİN (LLM) ---
ollama_host = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

llm = ChatOllama(
    model="llama3.2",
    temperature=0,
    base_url=ollama_host,
    repeat_penalty=1.1,
)

# --- 4. AJAN PROMPT (Talimatlar) ---
# Ajanın nasıl düşüneceğini belirten şablon
template = '''Sen Türkçe konuşan zeki bir asistansın. Sorulan soruya cevap vermek için elindeki araçları (Tools) kullanmalısın.

Elinin altındaki araçlar:
{tools}

Soru: {input}

Düşünce Süreci (Thought): Ne yapmam gerekiyor? (Sırasıyla düşün)
Adım (Action): Hangi aracı kullanmalıyım? [{tool_names}]
Adım Girdisi (Action Input): Araç için arama kelimesi nedir?
Gözlem (Observation): Aracın cevabı nedir?
... (Bu adımlar tekrarlanabilir)
Düşünce (Thought): Artık cevabı biliyorum.
Final Cevap (Final Answer): Sorunun Türkçe cevabı.

Haydi Başla!

Soru: {input}
Düşünce Süreci: {agent_scratchpad}'''

prompt = PromptTemplate.from_template(template)

# --- 5. AJANI OLUŞTUR (Standart AgentExecutor) ---
agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True, handle_parsing_errors=True)

print("✅ Ajan Hazır! Hem PDF'e hem İnternete bakabilir.")

# --- API ---
class QueryRequest(BaseModel):
    question: str

@app.post("/ask")
def ask_question(request: QueryRequest):
    try:
        start_time = time.time()
        
        # Ajanı çalıştır
        response = agent_executor.invoke({"input": request.question})
        
        duration = time.time() - start_time
        
        return {
            "answer": response["output"], # AgentExecutor 'output' döndürür
            "sources": ["Agent Decision (Web or DB)"],
            "processing_time": f"{duration:.2f} sn"
        }
        
    except Exception as e:
        print(f"HATA: {e}")
        raise HTTPException(status_code=500, detail=str(e))