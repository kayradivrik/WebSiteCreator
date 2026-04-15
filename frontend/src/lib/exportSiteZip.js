import JSZip from 'jszip';
import { buildStandaloneHtml, slugifyFileBase, triggerDownload } from './exportStaticHtml.js';
import { normalizePageSettings } from './pageSettingsDefaults.js';

async function fillSiteZip(zip, canvasState, meta) {
  const { title: titleRaw, ...rest } = meta;
  const title = titleRaw || 'sayfa';
  const s = normalizePageSettings(rest);
  const html = buildStandaloneHtml(canvasState, {
    title,
    ...s,
    bundleMode: 'local',
  });
  zip.file('index.html', html);

  const base = import.meta.env.BASE_URL || '/';
  const cssPath = `${base.endsWith('/') ? base : `${base}/`}site-export.css`;
  const cssRes = await fetch(cssPath, { cache: 'no-store' });
  if (!cssRes.ok) {
    throw new Error(
      'site-export.css indirilemedi. Geliştirmede bir kez `npm run build:site-css` çalıştırın; üretimde build sırasında üretilir.'
    );
  }
  zip.file('site-export.css', await cssRes.text());

  zip.file(
    'README.txt',
    `WebBuilder dışa aktarım
===================

- index.html tarayıcıda açın (site-export.css aynı klasörde olmalı).
- Netlify: Sürükle-bırak (https://app.netlify.com/drop) veya editördeki Dağıtım ile zip yükleyin.
- Vercel: vercel CLI veya editördeki token ile dağıtım.

Yerel önizleme: bu klasörde basit bir sunucu çalıştırın (ör. npx serve .) — file:// ile CSS yolu sorun çıkarabilir.
`
  );
  return slugifyFileBase(title);
}

/** Dağıtım API’si için base64 zip */
export async function buildSiteZipBase64(canvasState, meta = {}) {
  const zip = new JSZip();
  await fillSiteZip(zip, canvasState, meta);
  return zip.generateAsync({ type: 'base64' });
}

/**
 * index.html (yerel Tailwind CSS) + site-export.css + README zip indirir.
 */
export async function downloadSiteZip(canvasState, meta = {}) {
  const zip = new JSZip();
  const baseName = await fillSiteZip(zip, canvasState, meta);
  const b64 = await zip.generateAsync({ type: 'base64' });
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
  triggerDownload(`${baseName}-site.zip`, new Blob([arr], { type: 'application/zip' }));
}
