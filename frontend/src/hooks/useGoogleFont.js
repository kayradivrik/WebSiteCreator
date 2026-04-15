import { useEffect } from 'react';
import { googleFontStylesheetHref } from '../lib/pageSettingsDefaults.js';

const LINK_ID = 'wb-google-font-active';

/**
 * @param {string} googleFont — GOOGLE_FONT_SPECS anahtarı veya boş
 */
export function useGoogleFont(googleFont) {
  useEffect(() => {
    const prev = document.getElementById(LINK_ID);
    if (prev) prev.remove();

    const id = String(googleFont || '').trim();
    if (!id) return undefined;

    const href = googleFontStylesheetHref(id);
    if (!href) return undefined;

    const link = document.createElement('link');
    link.id = LINK_ID;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [googleFont]);
}
