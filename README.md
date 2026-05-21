# NASDAQ Trading Bot - Web Dashboard

Gelişmiş web tabanlı NASDAQ otonom trading bot yönetim paneli.

## 🚀 Kurulum

### 1. Gerekli Paketleri Kur
```bash
pip install -r requirements.txt
```

### 2. Ortam Değişkenlerini Ayarla
```bash
export ALPACA_API_KEY="your_api_key"
export ALPACA_SECRET_KEY="your_secret_key"
export ALPACA_PAPER_TRADING="true"  # Paper trading için
```

### 3. Flask Dashboard'u Başlat
```bash
python flask_app.py
```

Web arayüzü otomatik olarak `http://localhost:5000` adresinde açılacak.

## 📊 Özellikler

### Dashboard Görüntüleme
- ✅ **Gerçek Zamanlı KPI Kartları**: PnL, Portföy Değeri, Pozisyonlar, VIX, Nakit
- ✅ **WebSocket Bağlantı Durumu**: Canlı bağlantı göstergesi
- ✅ **Pozisyon Yönetimi**: Açık pozisyonların detaylı görülmesi
- ✅ **Piyasa Sıcaklık Haritası**: RSI tabanlı hisse sınıflandırması
- ✅ **Canlı Fiyatlar**: Tüm sembolerin güncel fiyatları
- ✅ **Uyarı Sistemi**: Kritik ereignislerin anında bildirimi
- ✅ **Canlı Loglar**: Bot aktivitesinin anlık izlenmesi

### Kontrol Paneli
- 🎮 **KILL SWITCH**: Tüm pozisyonları anında kapat
- 🔄 **RESET**: Sistemi sıfırla
- 🤖 **Bot Kontrol**: Trading'i aktif/pasif yap

### REST API Endpoints
| Endpoint | Metod | Açıklama |
|----------|-------|---------|
| `/api/status` | GET | Bot durumu |
| `/api/account` | GET | Hesap bilgileri |
| `/api/positions` | GET | Açık pozisyonlar |
| `/api/prices` | GET | Güncel fiyatlar |
| `/api/market-depth/<symbol>` | GET | Piyasa derinliği |
| `/api/vix` | GET | VIX değeri |
| `/api/heatmap` | GET | RSI sıcaklık haritası |
| `/api/alerts` | GET | Aktif uyarılar |
| `/api/logs` | GET | Bot logları |
| `/api/control/kill-switch` | POST | Acil durdurma |
| `/api/control/reset` | POST | Sistem resetleme |
| `/api/control/toggle-trading` | POST | Trading aktif/pasif |

## 🌐 Paralel Çalıştırma

### Terminal 1: Bot (Streamlit)
```bash
streamlit run deepseek_python_20260521_fc7173.py
```
Erişim: `http://localhost:8501`

### Terminal 2: Web Dashboard (Flask)
```bash
python flask_app.py
```
Erişim: `http://localhost:5000`

### Terminal 3: İsteğe Bağlı - API Testi
```bash
curl http://localhost:5000/api/status
```

## 📁 Dosya Yapısı

```
akif/
├── deepseek_python_20260521_fc7173.py  # Ana bot kodu
├── flask_app.py                         # Flask web sunucusu
├── requirements.txt                     # Python paketleri
├── templates/
│   └── dashboard.html                   # HTML şablonu
���── static/
│   ├── style.css                        # Dashboard CSS
│   └── script.js                        # Dashboard JavaScript
└── logs/
    └── nasdaq_bot.log                   # Bot logları
```

## 🎯 Kullanım

### 1. Bot'u Başlat
```bash
# Terminal 1
streamlit run deepseek_python_20260521_fc7173.py

# Terminal 2
python flask_app.py
```

### 2. Web Arayüzüne Erişim
Tarayıcıda açın: `http://localhost:5000`

### 3. Kontrol Panelini Kullan
- WebSocket durumunu izle
- Pozisyonları gözlemle
- Uyarıları kontrol et
- Gerekirse KILL SWITCH'i kullan

## 📈 Real-Time Veriler

Dashboard her 3 saniyede bir güncellenir:
- Hesap bilgileri
- Açık pozisyonlar
- Güncel fiyatlar
- Piyasa sıcaklık haritası
- WebSocket bağlantı durumu
- Uyarılar ve loglar

## 🔒 Güvenlik

- ✅ CORS desteği (ilgili domain'lerle)
- ✅ API rate limiting önerilir
- ✅ Üretim ortamında HTTPS kullanın
- ✅ API anahtarlarını `.env` dosyasında saklayın

## 🐛 Sorun Giderme

### WebSocket Kopuk Gösteriliyor
```bash
# WebSocket sunucusunun çalıştığını kontrol et
python -c "from deepseek_python_20260521_fc7173 import ws_manager; ws_manager.start()"
```

### Flask Başlamıyor
```bash
# Port 5000 meşgul olabilir
# Alternatif port kullan
python flask_app.py --port 5001
```

### API Timeout
```bash
# Bot'un çalışıp çalışmadığını kontrol et
curl http://localhost:5000/health
```

## 📝 Notlar

- Bot paper trading modunda çalışıyor (varsayılan)
- Live trading için `ALPACA_PAPER_TRADING=false` ayarla
- Log dosyası `logs/nasdaq_bot.log` adresinde tutulur
- Bellekte tutulan log limiti 500 satır (ayarlanabilir)

## 🔗 Kaynaklar

- Streamlit: https://streamlit.io/
- Flask: https://flask.palletsprojects.com/
- Alpaca Trading: https://alpaca.markets/
- yfinance: https://pypi.org/project/yfinance/

## 📧 Destek

Sorun ya da önerileriniz için GitHub Issues'ı kullanın.
