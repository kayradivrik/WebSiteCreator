import { sanitizeHref } from './url';

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cls(...parts) {
  return parts.filter(Boolean).join(' ').trim();
}

function classAttr(classes) {
  const c = cls(classes);
  return c ? ` class="${esc(c)}"` : '';
}

/** Önizleme ile uyumlu statik HTML (Tailwind sınıfları korunur) */
export function nodeToStaticHtml(node) {
  if (!node) return '';
  const p = node.props || {};
  const children = node.children || [];
  const ch = children.map(nodeToStaticHtml).join('');

  switch (node.type) {
    case 'Section':
      return `<section${classAttr(p.className)}>${ch}</section>`;
    case 'Container':
    case 'Grid':
      return `<div${classAttr(p.className)}>${ch}</div>`;
    case 'Card': {
      const c = cls(
        'bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6',
        p.className
      );
      return `<div${classAttr(c)}>${ch}</div>`;
    }
    case 'Heading': {
      const tag = HEADING_TAGS.has(p.level) ? p.level : 'h2';
      const safe = sanitizeHref(p.href);
      const text = esc(p.text ?? '');
      let inner = text;
      if (safe) {
        const rel = p.targetBlank ? ' rel="noopener noreferrer"' : '';
        const tgt = p.targetBlank ? ' target="_blank"' : '';
        inner = `<a href="${esc(safe)}" class="text-inherit no-underline hover:underline decoration-current underline-offset-2"${tgt}${rel}>${text}</a>`;
      }
      return `<${tag}${classAttr(p.className)}>${inner}${ch}</${tag}>`;
    }
    case 'Text': {
      const safe = sanitizeHref(p.href);
      const text = esc(p.text ?? '');
      let inner = text;
      if (safe) {
        const rel = p.targetBlank ? ' rel="noopener noreferrer"' : '';
        const tgt = p.targetBlank ? ' target="_blank"' : '';
        inner = `<a href="${esc(safe)}" class="text-inherit underline-offset-2 hover:underline"${tgt}${rel}>${text}</a>`;
      }
      return `<p${classAttr(p.className)}>${inner}${ch}</p>`;
    }
    case 'Button': {
      const safe = sanitizeHref(p.href);
      const baseCls = cls('inline-flex items-center justify-center', p.className);
      const hasChildren = children.length > 0;
      if (hasChildren) {
        const dcls = cls(baseCls, 'flex flex-col items-stretch gap-2');
        let innerBits = '';
        if (safe) {
          const rel = p.targetBlank ? ' rel="noopener noreferrer"' : '';
          const tgt = p.targetBlank ? ' target="_blank"' : '';
          innerBits += `<a href="${esc(safe)}" class="inline-flex items-center justify-center"${tgt}${rel}>${esc(p.text)}</a>`;
        } else if (p.text != null && p.text !== '') {
          innerBits += `<span class="inline-flex items-center justify-center">${esc(p.text)}</span>`;
        }
        return `<div role="group"${classAttr(dcls)}>${innerBits}${ch}</div>`;
      }
      if (safe) {
        const rel = p.targetBlank ? ' rel="noopener noreferrer"' : '';
        const tgt = p.targetBlank ? ' target="_blank"' : '';
        return `<a href="${esc(safe)}"${classAttr(baseCls)}${tgt}${rel}>${esc(p.text)}${ch}</a>`;
      }
      const typ = p.type && String(p.type).trim() ? esc(String(p.type).trim()) : 'button';
      return `<button type="${typ}"${classAttr(baseCls)}>${esc(p.text)}${ch}</button>`;
    }
    case 'Link': {
      const safe = sanitizeHref(p.href);
      const baseCls = cls('text-blue-600 underline underline-offset-2 hover:text-blue-800', p.className);
      if (!safe) {
        return `<span${classAttr(cls(baseCls, 'cursor-default opacity-80'))}>${esc(p.text || 'Link')}${ch}</span>`;
      }
      const rel = p.targetBlank ? ' rel="noopener noreferrer"' : '';
      const tgt = p.targetBlank ? ' target="_blank"' : '';
      return `<a href="${esc(safe)}"${classAttr(baseCls)}${tgt}${rel}>${esc(p.text || 'Link')}${ch}</a>`;
    }
    case 'Image': {
      const src = esc(p.src || 'https://via.placeholder.com/300');
      const alt = esc(p.alt || 'Image');
      const safeLink = sanitizeHref(p.linkHref);
      let img = `<img src="${src}" alt="${alt}" class="max-w-full h-auto object-cover rounded block" draggable="false" />`;
      if (safeLink) {
        const rel = p.targetBlank ? ' rel="noopener noreferrer"' : '';
        const tgt = p.targetBlank ? ' target="_blank"' : '';
        img = `<a href="${esc(safeLink)}" class="block"${tgt}${rel}>${img}</a>`;
      }
      const c = cls('inline-block max-w-full align-top', p.className);
      return `<span${classAttr(c)}>${img}${ch}</span>`;
    }
    default:
      return '';
  }
}

/** style etiketinden kaçış — ham kullanıcı CSS */
function safeInlineCss(css) {
  if (!css || typeof css !== 'string') return '';
  return css.replace(/<\//gi, '<\\/');
}

/**
 * Tek dosyada açılabilir HTML (Tailwind CDN).
 * @param {object} canvasState kök düğüm
 * @param {{ title?: string, customCSS?: string, favicon?: string }} meta
 */
export function buildStandaloneHtml(canvasState, meta = {}) {
  const title = meta.title || 'Sayfa';
  const inner = nodeToStaticHtml(canvasState);
  const css = safeInlineCss(meta.customCSS || '');
  const styleBlock = css ? `\n<style>\n${css}\n</style>` : '';
  const fav = (meta.favicon || '').trim();
  const favBlock =
    fav && /^https?:\/\//i.test(fav)
      ? `\n<link rel="icon" href="${esc(fav)}" />`
      : '';

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>${favBlock}${styleBlock}
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="antialiased">
${inner}
</body>
</html>`;
}

export function slugifyFileBase(name, fallback = 'sayfa') {
  const raw = String(name || fallback).trim();
  const base = [...raw]
    .map((ch) => {
      const code = ch.codePointAt(0);
      if (code < 32) return '_';
      if ('<>:"/\\|?*'.includes(ch)) return '_';
      return ch;
    })
    .join('')
    .replace(/\s+/g, '-')
    .slice(0, 80);
  return base || fallback;
}

export function triggerDownload(filename, blob) {
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadCanvasHtml(canvasState, { title, customCSS = '', favicon = '' } = {}) {
  const html = buildStandaloneHtml(canvasState, { title, customCSS, favicon });
  const name = `${slugifyFileBase(title)}.html`;
  triggerDownload(name, new Blob([html], { type: 'text/html;charset=utf-8' }));
}

export function downloadCanvasJson(canvasState, title) {
  const json = JSON.stringify(canvasState, null, 2);
  const name = `${slugifyFileBase(title)}-canvas.json`;
  triggerDownload(name, new Blob([json], { type: 'application/json;charset=utf-8' }));
}
