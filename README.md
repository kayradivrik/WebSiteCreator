# WebBuilder

**Türkçe:** Görsel sayfa düzenleyici — Tailwind sınıfları, hazır bloklar, HTML/zip dışa aktarma, Netlify/Vercel dağıtımı.  
**English:** Visual page builder with Tailwind-oriented markup, presets, static export, and optional deploy hooks.

## Özellikler

- Sürükle-tıkla canvas, bileşen paleti, geri al / yinele
- Sayfa ayarları: tema, Google Fonts, SEO (`metaTitle` / `metaDescription`)
- Önizleme, konsolda üretilen HTML görüntüleme, özel CSS ve canvas JSON
- Statik çıktı: tek HTML (Tailwind CDN veya yerel CSS ile zip)
- API: MongoDB veya dosya tabanlı depolama (`USE_FILE_DB`)
- Üretim için isteğe bağlı: API anahtarı (mutasyonlar), CORS listesi, rate limit

## Gereksinimler

- Node.js 20+ önerilir
- MongoDB (varsayılan) veya `USE_FILE_DB=true`

## Hızlı başlangıç

```bash
# Bağımlılıklar (kök, backend, frontend)
npm run setup

# Backend .env — örnek:
copy backend\.env.example backend\.env   # Windows
# Linux/macOS: cp backend/.env.example backend/.env
# En azından MONGO_URI veya USE_FILE_DB=true

# API + arayüz birlikte
npm run dev
```

- Arayüz: Vite’nin yazdığı adres (çoğunlukla `http://localhost:5173`)
- API: `http://127.0.0.1:5000` — sağlık: `GET http://127.0.0.1:5000/api/health`

## Komutlar

| Komut | Açıklama |
|--------|-----------|
| `npm run dev` | Backend + frontend geliştirme |
| `npm run dev:api` | Sadece API |
| `npm run dev:web` | Sadece Vite |
| `npm run build` | Frontend üretim derlemesi (`frontend/dist`) |
| `npm run verify` | Backend sözdizimi + frontend build + lint |

## Ortam değişkenleri

- **Backend:** `backend/.env.example` — `MONGO_URI`, `API_KEY`, `CORS_ORIGINS`, `JSON_BODY_LIMIT`, `API_RATE_MAX`, …
- **Frontend (build):** `frontend/.env.example` — `VITE_API_BASE_URL`, isteğe bağlı `VITE_API_KEY` (backend’de `API_KEY` ile aynı olmalı)

Üretim build öncesi `VITE_API_BASE_URL` mutlaka gerçek API kökeninize ayarlanmalıdır (sonunda `/api` yok).

## Proje yapısı

```
backend/     Express API, sayfa CRUD, dağıtım proxy uçları
frontend/    React + Vite editör ve önizleme
```

Önemli dosyalar: `frontend/src/lib/exportStaticHtml.js` (dışa aktarılan HTML), `frontend/src/store/useEditorStore.js` (canvas durumu).

## Güvenlik

İnternete açmadan önce `backend/.env.example` içindeki üretim notlarını okuyun. `API_KEY` yalnızca yazma işlemlerini korur; GET ile liste/detay varsayılan olarak açıktır (önizleme senaryosu). Hassas veri için ek katman (JWT, ayrı okuma politikası, ters proxy) planlayın.

Güvenlik açığı bildirimi: [SECURITY.md](./SECURITY.md).

## Katkı

Öneriler ve PR’lar için [CONTRIBUTING.md](./CONTRIBUTING.md).

## Lisans

[MIT](./LICENSE) — ticari ve kişisel kullanım için esnek; yine de kendi hukuki gereksinimlerinizi kontrol edin.
