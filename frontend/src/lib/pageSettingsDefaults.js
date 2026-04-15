/** @typedef {{ primary: string, secondary: string, accent: string, surface: string, text: string }} PageTheme */

/** @type {PageTheme} */
export const DEFAULT_THEME = {
  primary: '#2563eb',
  secondary: '#64748b',
  accent: '#0ea5e9',
  surface: '#f8fafc',
  text: '#0f172a',
};

export const DEFAULT_PAGE_SETTINGS = {
  favicon: '',
  customCSS: '',
  googleFont: '',
  /** Boşsa dışa aktarımda sayfa adı kullanılır */
  metaTitle: '',
  metaDescription: '',
  theme: { ...DEFAULT_THEME },
};

/**
 * Sunucu / eski kayıtlarla uyumlu tam sayfa ayarı.
 * @param {unknown} raw
 */
export function normalizePageSettings(raw) {
  const s = raw && typeof raw === 'object' ? raw : {};
  const t = s.theme && typeof s.theme === 'object' ? s.theme : {};
  return {
    favicon: typeof s.favicon === 'string' ? s.favicon : '',
    customCSS: typeof s.customCSS === 'string' ? s.customCSS : '',
    googleFont: typeof s.googleFont === 'string' ? s.googleFont : '',
    metaTitle: typeof s.metaTitle === 'string' ? s.metaTitle : '',
    metaDescription: typeof s.metaDescription === 'string' ? s.metaDescription : '',
    theme: {
      primary: typeof t.primary === 'string' ? t.primary : DEFAULT_THEME.primary,
      secondary: typeof t.secondary === 'string' ? t.secondary : DEFAULT_THEME.secondary,
      accent: typeof t.accent === 'string' ? t.accent : DEFAULT_THEME.accent,
      surface: typeof t.surface === 'string' ? t.surface : DEFAULT_THEME.surface,
      text: typeof t.text === 'string' ? t.text : DEFAULT_THEME.text,
    },
  };
}

/** @param {PageTheme} theme */
export function themeToCssVarsStyle(theme) {
  return {
    '--wb-primary': theme.primary,
    '--wb-secondary': theme.secondary,
    '--wb-accent': theme.accent,
    '--wb-surface': theme.surface,
    '--wb-text': theme.text,
  };
}

/** Google Fonts CSS2 family parametresi (örn. Inter:wght@400;600;700) */
export function googleFontStylesheetHref(googleFont) {
  const id = String(googleFont || '').trim();
  if (!id) return '';
  const spec = GOOGLE_FONT_SPECS[id];
  const q = spec || `${id.replace(/\s+/g, '+')}:wght@400;500;600;700`;
  return `https://fonts.googleapis.com/css2?family=${q}&display=swap`;
}

/** @type {Record<string, string>} id → family parametresi */
export const GOOGLE_FONT_SPECS = {
  Inter: 'Inter:wght@300;400;500;600;700;800',
  Roboto: 'Roboto:wght@300;400;500;700',
  'Open Sans': 'Open+Sans:wght@400;500;600;700',
  Lato: 'Lato:wght@300;400;700;900',
  Montserrat: 'Montserrat:wght@400;500;600;700;800',
  Poppins: 'Poppins:wght@300;400;500;600;700',
  'Source Sans 3': 'Source+Sans+3:wght@400;600;700',
  Merriweather: 'Merriweather:wght@400;700',
  'Playfair Display': 'Playfair+Display:wght@400;600;700',
  'DM Sans': 'DM+Sans:wght@400;500;600;700',
  'Nunito Sans': 'Nunito+Sans:wght@400;600;700;800',
  Outfit: 'Outfit:wght@300;400;500;600;700',
  Raleway: 'Raleway:wght@400;500;600;700',
  Ubuntu: 'Ubuntu:wght@400;500;700',
};

export const GOOGLE_FONT_IDS = Object.keys(GOOGLE_FONT_SPECS);
