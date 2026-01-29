import os
# PDF yükleyicisi (Bu hala community içinde, sorun yok)
from langchain_community.document_loaders import PyPDFLoader
# Metin parçalayıcı
from langchain_text_splitters import RecursiveCharacterTextSplitter
# --- YENİ KÜTÜPHANE: HuggingFace ---
from langchain_huggingface import HuggingFaceEmbeddings
# --- YENİ KÜTÜPHANE: Qdrant ---
from langchain_qdrant import QdrantVectorStore
# Qdrant Client (Veritabanını bellekte tutmak için ayar)
from qdrant_client import QdrantClient
from qdrant_client.http import models

def load_and_split_document(file_path):
    print(f"📄 Dosya yükleniyor: {file_path}")
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    
    # Chunking (Parçalama) Ayarları
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    
    splits = text_splitter.split_documents(documents)
    print(f"✅ Belge {len(splits)} parçaya bölündü.")
    return splits

def create_vector_db(splits):
    print("🧠 Embedding modeli hazırlanıyor...")
    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    print("🔧 Qdrant (RAM Modu) hazırlanıyor...")
    client = QdrantClient(path="./qdrant_db")

    collection_name = "my_documents"

    # Koleksiyonu (Tabloyu) 384 boyutlu vektörlere uygun olarak manuel yaratıyoruz
    # Eğer bu adımı yapmazsak, Qdrant vektör boyutunu tahmin etmeye çalışırken hata verebilir.
    client.recreate_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(
            size=384,
            distance=models.Distance.COSINE
        )
    )

    print("💾 Veritabanı bağlantısı kuruluyor...")
    
    # --- DEĞİŞİKLİK BURADA ---
    # from_documents yerine, önce sınıfı başlatıyoruz:
    vector_store = QdrantVectorStore(
        client=client,
        collection_name=collection_name,
        embedding=embedding_model,
    )
    
    print("📄 Dokümanlar ekleniyor...")
    # Sonra dokümanları içine atıyoruz:
    vector_store.add_documents(documents=splits)
    
    print("✅ Veritabanı hazır!")
    return vector_store

if __name__ == "__main__":
    pdf_path = "test.pdf" 
    
    if os.path.exists(pdf_path):
        # 1. Yükle
        doc_splits = load_and_split_document(pdf_path)
        
        # 2. Vektörleştir
        db = create_vector_db(doc_splits)
        
        # 3. Test Sorgusu
        query = "Bu belgenin ana konusu nedir?" 
        
        print(f"\n🔍 Soru: '{query}' için arama yapılıyor...")
        
        # Similarity Search
        results = db.similarity_search(query, k=3)
        
        print("\n--- BULUNAN SONUÇLAR ---")
        for i, doc in enumerate(results):
            print(f"\n[{i+1}] İçerik:")
            # İçeriği temizleyip (yeni satırları silip) gösterelim ki okunaklı olsun
            clean_content = doc.page_content.replace("\n", " ")
            print(clean_content[:300] + "...") 
    else:
        print("❌ PDF dosyası bulunamadı.")