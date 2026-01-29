import time
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import ChatOllama
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

def start_agent():
    print("🧠 Sistem Başlatılıyor...")
    
    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    client = QdrantClient(path="./qdrant_db")
    
    vector_store = QdrantVectorStore(
        client=client,
        collection_name="my_documents",
        embedding=embedding_model,
    )
    
    retriever = vector_store.as_retriever(search_kwargs={"k": 3})
    
    # --- DEĞİŞİKLİK 1: Daha Hızlı Model ---
    print("🚀 Ollama (Llama 3.2) Bağlanıyor...")
    llm = ChatOllama(
        model="llama3.2",  # 3 yerine 3.2 (Çok daha hızlı)
        temperature=0.3,   # Biraz yaratıcılık verelim ki cümleler akıcı olsun
    )
    
    # --- DEĞİŞİKLİK 2: Kesin Türkçe Prompt ---
    prompt = ChatPromptTemplate.from_template("""
    Sen Türkçe konuşan profesyonel bir yapay zeka asistanısın.
    Aşağıdaki "Bağlam" (Context) bilgisini kullanarak kullanıcının sorusunu cevapla.
    
    Kurallar:
    1. Cevabı MUTLAKA Türkçe ver.
    2. Eğer cevap bağlamda yoksa "Dokümanlarda bu bilgiye ulaşamadım" de.
    3. Cevabın kısa, net ve anlaşılır olsun.
    
    <Bağlam>
    {context}
    </Bağlam>

    Soru: {input}
    """)
    
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    
    print("\n✅ NexusAI v2 Hazır! (Hızlandırılmış Versiyon)\n")
    
    while True:
        user_input = input("Siz: ")
        if user_input.lower() == 'q':
            break
            
        start_time = time.time()
        print("⚡ Düşünüyor...", end="\r")
        
        try:
            response = rag_chain.invoke({"input": user_input})
            end_time = time.time()
            duration = end_time - start_time
            
            print(f"\nNexusAI ({duration:.2f}sn):")
            print(response["answer"])
            
            print("\n--- Kaynaklar ---")
            for i, doc in enumerate(response["context"]):
                # İçeriği temizleyip (boşlukları silip) ilk 50 karakteri gösterelim
                content_preview = doc.page_content.replace("\n", " ")[:50]
                print(f"[{i+1}] ...{content_preview}...")
            print("-" * 50)
            
        except Exception as e:
            print(f"\n❌ Bir hata oluştu: {e}")

if __name__ == "__main__":
    start_agent()