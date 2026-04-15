import React, { useState } from 'react';
import { X, Rocket } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { apiFetch } from '../../lib/api';
import { buildStandaloneHtml } from '../../lib/exportStaticHtml.js';
import { normalizePageSettings } from '../../lib/pageSettingsDefaults.js';
import { buildSiteZipBase64 } from '../../lib/exportSiteZip.js';

/**
 * Netlify (zip) ve Vercel (tek HTML) dağıtımı — token tarayıcıdan backend’e gider, backend API’ye iletir (CORS yok).
 */
export function DeploySiteModal({ onClose, pageTitle }) {
  const [tab, setTab] = useState('netlify');
  const [netlifySiteId, setNetlifySiteId] = useState('');
  const [netlifyToken, setNetlifyToken] = useState('');
  const [vercelToken, setVercelToken] = useState('');
  const [vercelTeamId, setVercelTeamId] = useState('');
  const [vercelProject, setVercelProject] = useState('webbuilder-site');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const pageMeta = () => {
    const { canvasState, pageSettings, pageName } = useEditorStore.getState();
    const s = normalizePageSettings(pageSettings);
    return {
      canvasState,
      meta: {
        title: pageTitle || pageName || 'sayfa',
        ...s,
      },
    };
  };

  const deployNetlify = async () => {
    setMsg(null);
    const siteId = netlifySiteId.trim();
    const token = netlifyToken.trim();
    if (!siteId || !token) {
      setMsg({ type: 'err', text: 'Site ID ve Netlify token gerekli.' });
      return;
    }
    setBusy(true);
    try {
      const { canvasState, meta } = pageMeta();
      const zipBase64 = await buildSiteZipBase64(canvasState, meta);
      const r = await apiFetch('/deploy/netlify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, token, zipBase64 }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setMsg({ type: 'err', text: data.error || data.message || 'Netlify hatası' });
        return;
      }
      setMsg({
        type: 'ok',
        text: data.url ? `Yayın: ${data.url}` : 'Dağıtım oluşturuldu.',
      });
    } catch (e) {
      setMsg({ type: 'err', text: e?.message || 'İstek başarısız' });
    } finally {
      setBusy(false);
    }
  };

  const deployVercel = async () => {
    setMsg(null);
    const token = vercelToken.trim();
    if (!token) {
      setMsg({ type: 'err', text: 'Vercel token gerekli.' });
      return;
    }
    setBusy(true);
    try {
      const { canvasState, meta } = pageMeta();
      const html = buildStandaloneHtml(canvasState, { ...meta, bundleMode: 'cdn' });
      const r = await apiFetch('/deploy/vercel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          teamId: vercelTeamId.trim() || undefined,
          projectName: vercelProject.trim() || 'webbuilder-site',
          html,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setMsg({ type: 'err', text: data.error || data.message || 'Vercel hatası' });
        return;
      }
      setMsg({
        type: 'ok',
        text: data.url ? `Önizleme: ${data.url}` : 'Dağıtım oluşturuldu.',
      });
    } catch (e) {
      setMsg({ type: 'err', text: e?.message || 'İstek başarısız' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deploy-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <h2 id="deploy-modal-title" className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Rocket className="h-4 w-4 text-violet-600" />
            Site dağıtımı
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setTab('netlify')}
            className={`flex-1 py-2 text-xs font-medium ${tab === 'netlify' ? 'border-b-2 border-violet-600 text-violet-600' : 'text-gray-500'}`}
          >
            Netlify (zip)
          </button>
          <button
            type="button"
            onClick={() => setTab('vercel')}
            className={`flex-1 py-2 text-xs font-medium ${tab === 'vercel' ? 'border-b-2 border-violet-600 text-violet-600' : 'text-gray-500'}`}
          >
            Vercel (HTML)
          </button>
        </div>

        <div className="space-y-3 px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
          {tab === 'netlify' ? (
            <>
              <p className="leading-relaxed text-gray-500 dark:text-gray-400">
                Netlify → User settings → Applications → Personal access tokens. Site overview → Site ID.
                Zip içinde index.html + site-export.css gönderilir.
              </p>
              <label className="block space-y-1">
                <span className="font-medium">Site ID</span>
                <input
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 font-mono dark:border-gray-700 dark:bg-gray-950"
                  value={netlifySiteId}
                  onChange={(e) => setNetlifySiteId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  autoComplete="off"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-medium">Personal access token</span>
                <input
                  type="password"
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 font-mono dark:border-gray-700 dark:bg-gray-950"
                  value={netlifyToken}
                  onChange={(e) => setNetlifyToken(e.target.value)}
                  autoComplete="off"
                />
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() => void deployNetlify()}
                className="w-full rounded-lg bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {busy ? 'Gönderiliyor…' : 'Zip ile dağıt'}
              </button>
            </>
          ) : (
            <>
              <p className="leading-relaxed text-gray-500 dark:text-gray-400">
                Vercel hesabı → Settings → Tokens. Tek dosya HTML (Tailwind CDN ile) yüklenir. Takım kullanıyorsanız Team
                ID’yi girin.
              </p>
              <label className="block space-y-1">
                <span className="font-medium">Token</span>
                <input
                  type="password"
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 font-mono dark:border-gray-700 dark:bg-gray-950"
                  value={vercelToken}
                  onChange={(e) => setVercelToken(e.target.value)}
                  autoComplete="off"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-medium">Takım ID (isteğe bağlı)</span>
                <input
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 font-mono dark:border-gray-700 dark:bg-gray-950"
                  value={vercelTeamId}
                  onChange={(e) => setVercelTeamId(e.target.value)}
                  placeholder="team_..."
                  autoComplete="off"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-medium">Proje adı</span>
                <input
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-950"
                  value={vercelProject}
                  onChange={(e) => setVercelProject(e.target.value)}
                  autoComplete="off"
                />
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() => void deployVercel()}
                className="w-full rounded-lg bg-black py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {busy ? 'Gönderiliyor…' : 'HTML ile dağıt'}
              </button>
            </>
          )}

          {msg && (
            <p
              className={
                msg.type === 'ok'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }
            >
              {msg.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
