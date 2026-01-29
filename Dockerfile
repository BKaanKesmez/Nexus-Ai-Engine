# 1. Hafif bir Python sürümü kullan (Linux tabanlı)
FROM python:3.11-slim

# 2. Çalışma klasörünü ayarla
WORKDIR /app

# 3. Gereksinim dosyasını kopyala ve kütüphaneleri kur
COPY requirements.txt .
# --no-cache-dir: Docker imajını şişirmemek için önbelleği temizle
RUN pip install --no-cache-dir -r requirements.txt

# 4. Kod dosyalarını kopyala
COPY . .

# 5. API Portunu dışarı aç (FastAPI varsayılan portu 8000)
EXPOSE 8000

# 6. Uygulamayı başlat
# host 0.0.0.0: Dış dünyadan gelen isteklere açık ol demek
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]