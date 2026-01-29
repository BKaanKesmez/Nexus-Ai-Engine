import streamlit as st
import requests
import time

# --- AYARLAR ---
API_URL = "http://127.0.0.1:8000/ask"
st.set_page_config(page_title="NexusAI Asistan", page_icon="🤖", layout="centered")

# --- BAŞLIK VE TASARIM ---
st.title("🤖 NexusAI Kurumsal Asistan")
st.markdown("---")

# Sohbet Geçmişini Başlat (Sayfa yenilenince gitmesin)
if "messages" not in st.session_state:
    st.session_state.messages = []

# Eski mesajları ekrana çiz
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# --- KULLANICI GİRİŞİ ---
if prompt := st.chat_input("Sorunuzu buraya yazın..."):
    # 1. Kullanıcı mesajını ekrana bas
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # 2. Asistan cevabı için alan aç
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        message_placeholder.markdown("⚡ Düşünüyor...")
        
        try:
            # API'ye istek at
            response = requests.post(API_URL, json={"question": prompt})
            
            if response.status_code == 200:
                data = response.json()
                answer = data["answer"]
                sources = data["sources"]
                
                # Kaynakları formatla
                source_text = "\n\n**📚 Kaynaklar:**\n"
                for src in sources:
                    source_text += f"- *{src}*\n"
                
                full_response = answer + source_text
                
                # Cevabı yazdır
                message_placeholder.markdown(full_response)
                
                # Geçmişe kaydet
                st.session_state.messages.append({"role": "assistant", "content": full_response})
            else:
                message_placeholder.error("❌ API Hatası: Bağlantı kurulamadı.")
                
        except Exception as e:
            message_placeholder.error(f"❌ Hata: {e}")

# --- YAN PANEL (SIDEBAR) ---
with st.sidebar:
    st.header("NexusAI v1.0")
    st.info("Bu sistem RAG (Retrieval-Augmented Generation) mimarisi kullanmaktadır.")
    st.markdown("---")
    if st.button("Sohbeti Temizle"):
        st.session_state.messages = []
        st.rerun()