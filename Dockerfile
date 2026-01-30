# Hafif Python imajı
FROM python:3.11-slim

# Çalışma dizini
WORKDIR /app

# Sistem gereksinimleri (temizliğiyle birlikte)
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Pip ayarları (Hız için önbellek kapalı)
ENV PIP_DEFAULT_TIMEOUT=100 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

# --- HIZLANDIRMA BÖLÜMÜ ---
# 1. Önce PyTorch'un CPU sürümünü (Hafif Sürüm) yükle.
# Bu satır 2GB yerine sadece ~150MB indirmesini sağlar.
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu

# 2. Şimdi requirements.txt dosyasını kopyala
COPY requirements.txt .

# 3. Diğer paketleri yükle
# (Torch zaten yüklü olduğu için onu tekrar indirmeyecek, zaman kazanacaksın)
RUN pip install -r requirements.txt

# 4. Kaynak kodları kopyala
COPY . .

# Başlat
EXPOSE 8000
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]