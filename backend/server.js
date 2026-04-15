require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const mongoose = require('mongoose');

const USE_FILE_DB = process.env.USE_FILE_DB === 'true';
const PAGES_FILE = path.join(__dirname, 'data', 'pages.json');

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

/** Arkada nginx / load balancer varsa istemci IP ve rate limit için (0 = kapalı) */
if (Number(process.env.TRUST_PROXY_HOPS || 0) > 0) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS));
}

/** Virgülle ayrılmış tam kökenler (örn. https://app.example.com,http://localhost:5173) */
function parseCorsOrigins() {
  const raw = (process.env.CORS_ORIGINS || '').trim();
  if (!raw) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

const corsOrigins = parseCorsOrigins();
if (isProd && corsOrigins.length === 0) {
  console.warn(
    '[CORS] NODE_ENV=production iken CORS_ORIGINS boş — tüm kökenlere yansıtma açık. Üretimde CORS_ORIGINS ayarlayın.'
  );
}

const jsonBodyLimit = (process.env.JSON_BODY_LIMIT || '').trim() || (isProd ? '12mb' : '50mb');

/** Mongo modunda DB hazır mı (bağlantı düşerse false olabilir) */
function mongoConnected() {
  return !USE_FILE_DB && mongoose.connection.readyState === 1;
}

let Page = null;

/** Boş / null slug MongoDB'de unique index ile çakışır; istek ve belgelerde alan hiç olmamalı */
function normalizeSlugInput(value) {
  if (value === null || value === undefined) return undefined;
  const s = String(value).trim();
  return s ? s : undefined;
}

/** Sayfa adından URL slug (a-z0-9-); boşsa sayfa */
function slugifyFromName(name) {
  const raw = String(name ?? '').trim();
  if (!raw) return 'sayfa';
  const s = raw
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return s || 'sayfa';
}

function uniqueSlugAmongPages(base, pages, excludeId) {
  const taken = new Set(
    pages
      .filter((p) => (excludeId ? String(p._id) !== String(excludeId) : true))
      .map((p) => p.slug)
      .filter(Boolean)
  );
  let candidate = base.slice(0, 80);
  let n = 2;
  while (taken.has(candidate)) {
    const suffix = `-${n}`;
    candidate = `${base.slice(0, Math.max(1, 80 - suffix.length))}${suffix}`;
    n += 1;
  }
  return candidate;
}

async function uniqueSlugInMongo(base, excludeId) {
  let candidate = base.slice(0, 80);
  let n = 2;
  const query = (slug) =>
    excludeId && mongoose.isValidObjectId(String(excludeId))
      ? { slug, _id: { $ne: new mongoose.Types.ObjectId(String(excludeId)) } }
      : { slug };
  while (await Page.exists(query(candidate))) {
    const suffix = `-${n}`;
    candidate = `${base.slice(0, Math.max(1, 80 - suffix.length))}${suffix}`;
    n += 1;
  }
  return candidate;
}

/** Eski koleksiyonlarda slug_1 unique ama sparse değilse { slug: null } yinelenemez hatası verir */
async function repairPageSlugIndex() {
  if (USE_FILE_DB || !Page) return;
  try {
    const col = mongoose.connection.collection('pages');
    const unset = await col.updateMany({ $or: [{ slug: null }, { slug: '' }] }, { $unset: { slug: '' } });
    if (unset.modifiedCount > 0) {
      console.log(`[MongoDB] Boş slug alanı kaldırıldı: ${unset.modifiedCount} belge`);
    }

    const indexes = await col.indexes();
    for (const idx of indexes) {
      const k = idx.key || {};
      if (k.slug === 1 && idx.unique === true && idx.sparse !== true) {
        const n = idx.name || 'slug_1';
        console.warn(`[MongoDB] slug dizini sparse değil, kaldırılıyor: ${n}`);
        await col.dropIndex(n);
      }
    }

    await Page.syncIndexes();
    console.log('[MongoDB] Page dizinleri senkronize');
  } catch (err) {
    console.error('[MongoDB] slug dizini onarımı:', err.message);
  }
}

async function initDatabase() {
  if (USE_FILE_DB) return;
  const uri = (process.env.MONGO_URI || '').trim();
  if (!uri) {
    console.error('MONGO_URI tanımlı değil. USE_FILE_DB=false iken .env dosyasına MONGO_URI ekleyin veya USE_FILE_DB=true yapın.');
    process.exit(1);
  }
  Page = require('./models/Page');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Bağlantı koptu');
  });
  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] Yeniden bağlandı');
  });
  console.log('MongoDB Connected');
  await repairPageSlugIndex();
}

const corsMethods = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const corsAllowedHeaders = ['Content-Type', 'Authorization', 'X-Api-Key'];

app.use(
  cors(
    corsOrigins.length > 0
      ? {
          origin(origin, callback) {
            if (!origin) return callback(null, true);
            if (corsOrigins.includes(origin)) return callback(null, true);
            return callback(null, false);
          },
          methods: corsMethods,
          allowedHeaders: corsAllowedHeaders,
        }
      : {
          origin: true,
          methods: corsMethods,
          allowedHeaders: corsAllowedHeaders,
        }
  )
);
app.use(express.json({ limit: jsonBodyLimit }));

const apiRootJson = (_req, res) => {
  res.status(200).json({
    message: 'Web Builder API',
    hint: 'Sayfa listesi: GET /api/pages — sil: DELETE /api/pages/:id — sağlık: GET /api/health',
  });
};
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  const pathOnly = String(req.path || '/').replace(/\/+$/, '') || '/';
  if (pathOnly === '/api') {
    return apiRootJson(req, res);
  }
  next();
});

app.get('/', (_req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Web Builder — API</title>
</head>
<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:2.5rem auto;padding:0 1rem;line-height:1.5">
  <h1 style="font-size:1.25rem">Bu adres yalnızca API</h1>
  <p>Port <strong>${PORT}</strong> arka uç içindir; burada web arayüzü yok.</p>
  <p>Ön yüz için proje klasöründe <code style="background:#f3f4f6;padding:0.15rem 0.4rem;border-radius:4px">npm run dev</code> çalıştırın ve terminalde Vite’nin yazdığı adresi açın (ör. <code>http://localhost:5173</code> veya <code>5175</code>).</p>
  <p style="font-size:0.9rem;color:#555">Deneme: <a href="/api/health">/api/health</a> · <a href="/api/pages">/api/pages</a></p>
</body>
</html>`);
});

app.get('/favicon.ico', (_req, res) => res.status(204).end());

function mongoUnavailable(res) {
  return res.status(503).json({
    error: 'Veritabanı bağlantısı yok',
    hint: 'MongoDB URI ve ağ erişimini kontrol edin veya USE_FILE_DB=true ile dosya modunu kullanın.',
  });
}

/** Express 5 + /api/pages/:id bazen listeyle çakışabiliyor; tüm /api altı Router ile sabit sıra */
const api = express.Router();

api.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: Number(process.env.API_RATE_MAX || (isProd ? 240 : 3000)),
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/health',
  })
);

/** API_KEY tanımlıysa POST/DELETE/PATCH/PUT mutasyonlarında zorunlu (GET açık — önizleme/liste). */
function requireApiKeyForMutations(req, res, next) {
  const expected = (process.env.API_KEY || '').trim();
  if (!expected) return next();
  const m = req.method.toUpperCase();
  if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') return next();
  const auth = String(req.headers.authorization || '');
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const headerKey = String(req.headers['x-api-key'] || '').trim();
  const token = bearer || headerKey;
  if (token && token === expected) return next();
  return res.status(401).json({
    error: 'Yetkisiz',
    hint: 'Authorization: Bearer <API_KEY> veya X-Api-Key üstbilgisi gerekli.',
  });
}

api.use((_req, res, next) => {
  res.setHeader('X-Web-Builder-Api', '1');
  next();
});
api.use(requireApiKeyForMutations);

api.get('/health', (_req, res) => {
  res.json({
    ok: USE_FILE_DB || mongoConnected(),
    fileDb: USE_FILE_DB,
    mongo: USE_FILE_DB ? null : { connected: mongoConnected(), state: mongoose.connection.readyState },
  });
});

/** Netlify: zip dosyasını kullanıcı token’ı ile yükler (tarayıcı CORS yerine backend). */
api.post('/deploy/netlify', async (req, res) => {
  try {
    const { siteId, token, zipBase64 } = req.body || {};
    if (!siteId || !token || !zipBase64) {
      return res.status(400).json({ error: 'siteId, token ve zipBase64 gerekli' });
    }
    const buf = Buffer.from(String(zipBase64), 'base64');
    if (!buf.length) return res.status(400).json({ error: 'Geçersiz zip verisi' });
    const r = await fetch(`https://api.netlify.com/api/v1/sites/${encodeURIComponent(String(siteId).trim())}/deploys`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${String(token).trim()}`,
        'Content-Type': 'application/zip',
      },
      body: buf,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({
        error: data.message || data.error || `Netlify HTTP ${r.status}`,
      });
    }
    return res.json({ url: data.ssl_url || data.url, id: data.id });
  } catch (e) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

/** Vercel: tek HTML (CDN’li) — API şekli hesaba göre değişebilir. */
api.post('/deploy/vercel', async (req, res) => {
  try {
    const { token, teamId, projectName, html } = req.body || {};
    if (!token || !html) return res.status(400).json({ error: 'token ve html gerekli' });
    const name = String(projectName || 'webbuilder-site')
      .replace(/[^a-z0-9-]/gi, '-')
      .slice(0, 48)
      .replace(/^-+|-+$/g, '') || 'webbuilder-site';
    const qs = teamId && String(teamId).trim() ? `?teamId=${encodeURIComponent(String(teamId).trim())}` : '';
    const payload = {
      name,
      version: 2,
      files: [{ file: 'index.html', data: String(html) }],
    };
    const r = await fetch(`https://api.vercel.com/v13/deployments${qs}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${String(token).trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({
        error: data.error?.message || data.message || JSON.stringify(data).slice(0, 400),
      });
    }
    return res.json({ url: data.url });
  } catch (e) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// Yeni oluştur veya kaydet
api.post('/pages', async (req, res) => {
  try {
    if (!USE_FILE_DB && !mongoConnected()) {
      return mongoUnavailable(res);
    }

    const { id, name, canvasState, settings } = req.body;
    const slugClean = normalizeSlugInput(req.body.slug);

    if (USE_FILE_DB) {
      const pages = loadFilePages();
      const now = new Date().toISOString();
      if (id) {
        const idx = pages.findIndex((p) => p._id === id);
        if (idx === -1) return res.status(404).json({ message: 'Page not found' });
        const next = {
          ...pages[idx],
          name: name ?? pages[idx].name,
          canvasState: canvasState ?? pages[idx].canvasState,
          settings: settings !== undefined ? settings : pages[idx].settings,
          updatedAt: now,
        };
        if (req.body.slug !== undefined) {
          if (slugClean) next.slug = slugClean;
          else delete next.slug;
        }
        pages[idx] = next;
        saveFilePages(pages);
        return res.json(pages[idx]);
      }
      const displayName = name || 'Untitled Page';
      const baseSlug = slugifyFromName(slugClean || displayName);
      const slugFinal = uniqueSlugAmongPages(baseSlug, pages, null);
      const page = {
        _id: randomUUID(),
        name: displayName,
        slug: slugFinal,
        canvasState: canvasState || {},
        settings: settings || { favicon: '', customCSS: '' },
        createdAt: now,
        updatedAt: now,
      };
      pages.push(page);
      saveFilePages(pages);
      return res.json(page);
    }

    if (id && !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Geçersiz sayfa kimliği' });
    }

    let page;
    if (id) {
      const $set = { name, canvasState, settings };
      if (slugClean) $set.slug = slugClean;
      page = await Page.findByIdAndUpdate(id, { $set }, { new: true });
      if (!page) return res.status(404).json({ message: 'Page not found' });
    } else {
      const displayName = name || 'Untitled Page';
      const baseSlug = slugifyFromName(slugClean || displayName);
      const slugFinal = await uniqueSlugInMongo(baseSlug, null);
      page = await Page.create({
        name: displayName,
        slug: slugFinal,
        canvasState: canvasState || {},
        settings: settings || { favicon: '', customCSS: '' },
      });
    }
    res.json(page);
  } catch (error) {
    const msg = error.message || String(error);
    if (msg.includes('E11000') && msg.includes('slug')) {
      return res.status(409).json({
        error: 'Bu slug zaten kullanılıyor',
        hint: 'Başka bir slug seçin veya slug alanını boş bırakın.',
      });
    }
    res.status(500).json({ error: msg });
  }
});

const listPagesHandler = async (req, res) => {
  try {
    if (!USE_FILE_DB && !mongoConnected()) {
      return mongoUnavailable(res);
    }

    if (USE_FILE_DB) {
      const pages = loadFilePages();
      const list = pages
        .map((p) => ({
          _id: p._id,
          name: p.name,
          slug: p.slug,
          updatedAt: p.updatedAt,
        }))
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
      return res.json(list);
    }
    const pages = await Page.find()
      .sort({ updatedAt: -1 })
      .select('name slug updatedAt')
      .lean();
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

api.get('/pages', listPagesHandler);
api.get('/pages/', listPagesHandler);

/** Tam yol /pages/:id/duplicate — :id ile karışmaması için GET /pages/:id'den önce */
api.post('/pages/:id/duplicate', async (req, res) => {
  try {
    if (!USE_FILE_DB && !mongoConnected()) {
      return mongoUnavailable(res);
    }

    const { id } = req.params;

    if (USE_FILE_DB) {
      const pages = loadFilePages();
      const src = pages.find((p) => String(p._id) === String(id));
      if (!src) return res.status(404).json({ message: 'Page not found' });
      const displayName = `${src.name || 'Sayfa'} (Kopya)`;
      const baseSlug = slugifyFromName(displayName);
      const slugFinal = uniqueSlugAmongPages(baseSlug, pages, null);
      const now = new Date().toISOString();
      const copy = {
        _id: randomUUID(),
        name: displayName,
        slug: slugFinal,
        canvasState: JSON.parse(JSON.stringify(src.canvasState || {})),
        settings: src.settings ? JSON.parse(JSON.stringify(src.settings)) : { favicon: '', customCSS: '' },
        createdAt: now,
        updatedAt: now,
      };
      pages.push(copy);
      saveFilePages(pages);
      return res.status(201).json(copy);
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Geçersiz sayfa kimliği' });
    }

    const src = await Page.findById(id).lean();
    if (!src) return res.status(404).json({ message: 'Page not found' });

    const displayName = `${src.name || 'Sayfa'} (Kopya)`;
    const baseSlug = slugifyFromName(displayName);
    const slugFinal = await uniqueSlugInMongo(baseSlug, null);
    const copy = await Page.create({
      name: displayName,
      slug: slugFinal,
      canvasState: src.canvasState || {},
      settings: src.settings || { favicon: '', customCSS: '' },
    });
    return res.status(201).json(copy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** Liste rotaları üstte; /pages/:id yalnızca ek segment varken eşleşir */
api.get('/pages/:id', async (req, res) => {
  try {
    if (!USE_FILE_DB && !mongoConnected()) {
      return mongoUnavailable(res);
    }

    if (USE_FILE_DB) {
      const pages = loadFilePages();
      const page = pages.find((p) => p._id === req.params.id);
      if (!page) return res.status(404).json({ message: 'Page not found' });
      return res.json(page);
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Geçersiz sayfa kimliği' });
    }

    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

api.delete('/pages/:id', async (req, res) => {
  try {
    if (!USE_FILE_DB && !mongoConnected()) {
      return mongoUnavailable(res);
    }

    const { id } = req.params;

    if (USE_FILE_DB) {
      const pages = loadFilePages();
      const idx = pages.findIndex((p) => String(p._id) === String(id));
      if (idx === -1) return res.status(404).json({ message: 'Page not found' });
      pages.splice(idx, 1);
      saveFilePages(pages);
      return res.status(204).end();
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Geçersiz sayfa kimliği' });
    }

    const deleted = await Page.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Page not found' });
    return res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api', api);

function loadFilePages() {
  try {
    return JSON.parse(fs.readFileSync(PAGES_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveFilePages(pages) {
  fs.mkdirSync(path.dirname(PAGES_FILE), { recursive: true });
  fs.writeFileSync(PAGES_FILE, JSON.stringify(pages, null, 2), 'utf8');
}

// Bozuk JSON gövdesi
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'İstek gövdesi geçerli JSON değil' });
  }
  next(err);
});

app.use((err, req, res, _next) => {
  console.error(err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Sunucu hatası' });
});

process.on('unhandledRejection', (reason) => {
  console.error('UnhandledRejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('uncaughtException:', err);
  process.exit(1);
});

async function start() {
  try {
    await initDatabase();
  } catch (err) {
    console.error('Veritabanı başlatılamadı:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Loaded: ${path.resolve(__dirname, 'server.js')}`);
    console.log(`Probe: GET http://127.0.0.1:${PORT}/api/health — yanıtta X-Web-Builder-Api: 1 olmalı`);
    if (USE_FILE_DB) console.log('Using file-based storage (data/pages.json)');
    if ((process.env.API_KEY || '').trim()) {
      console.log('[Auth] API_KEY tanımlı — POST/DELETE/PATCH/PUT için X-Api-Key veya Bearer gerekli (GET açık).');
    }
    if (corsOrigins.length) console.log(`[CORS] İzinli kökenler: ${corsOrigins.join(', ')}`);
    console.log(`[Body] JSON limit: ${jsonBodyLimit}`);
  });
}

start();
