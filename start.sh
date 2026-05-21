#!/bin/bash

# NASDAQ Trading Bot - Başlatma Scripti

echo "========================================="
echo "  NASDAQ Trading Bot - Başlangıç"
echo "========================================="
echo ""

# Python versiyonu kontrol et
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python Versiyonu: $python_version"

# Gerekli paketleri kur
echo ""
echo "📦 Gerekli paketler kuruluyor..."
pip install -r requirements.txt > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Paketler kuruldu"
else
    echo "✗ Paket kurulumunda hata"
    exit 1
fi

# Ortam değişkenlerini kontrol et
echo ""
echo "🔑 Alpaca API Anahtarları Kontrol Ediliyor..."

if [ -z "$ALPACA_API_KEY" ]; then
    echo "⚠ ALPACA_API_KEY ayarlanmadı"
    read -p "API Key girin: " ALPACA_API_KEY
    export ALPACA_API_KEY
fi

if [ -z "$ALPACA_SECRET_KEY" ]; then
    echo "⚠ ALPACA_SECRET_KEY ayarlanmadı"
    read -sp "Secret Key girin: " ALPACA_SECRET_KEY
    export ALPACA_SECRET_KEY
    echo ""
fi

echo "✓ API Anahtarları ayarlandı"

# Log dizini oluştur
mkdir -p logs

# Dashboard'u başlat
echo ""
echo "========================================="
echo "  📊 Kontrol Paneli Başlatılıyor..."
echo "========================================="
echo "  Web Arayüzü: http://localhost:5000"
echo "========================================="
echo ""

python flask_app.py
