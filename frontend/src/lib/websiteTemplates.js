/**
 * Tam sayfa website şablonları (kök id: root).
 * Yüklemede store tüm alt id’leri yeniden üretir; kök daima root kalır.
 */

export const WEBSITE_TEMPLATES = [
  {
    id: 'saas-landing',
    name: 'SaaS / ürün sayfası',
    description: 'Nav, kahraman, logo bandı, 3 özellik, koyu CTA.',
    canvasState: {
      id: 'root',
      type: 'Section',
      props: { className: 'w-full min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100' },
      children: [
        {
          id: 'w_nav',
          type: 'Container',
          props: {
            className:
              'max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800',
          },
          children: [
            {
              id: 'w_logo',
              type: 'Heading',
              props: { text: 'Flowkit', level: 'h2', className: 'text-xl font-bold tracking-tight' },
            },
            {
              id: 'w_links',
              type: 'Grid',
              props: { className: 'flex gap-6 text-sm text-slate-600 dark:text-slate-400' },
              children: [
                { id: 'w_l1', type: 'Link', props: { text: 'Özellikler', href: '#', className: '' } },
                { id: 'w_l2', type: 'Link', props: { text: 'Fiyatlar', href: '#', className: '' } },
                { id: 'w_l3', type: 'Link', props: { text: 'Dokümantasyon', href: '#', className: '' } },
              ],
            },
            {
              id: 'w_ct',
              type: 'Button',
              props: {
                text: 'Panele git',
                href: '#',
                className: 'px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700',
              },
            },
          ],
        },
        {
          id: 'w_hero',
          type: 'Container',
          props: { className: 'max-w-6xl mx-auto px-6 py-16 md:py-24 text-center flex flex-col items-center gap-6' },
          children: [
            {
              id: 'w_h1',
              type: 'Heading',
              props: {
                text: 'Müşterilerinizi tek panelden yönetin',
                level: 'h1',
                className: 'text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl',
              },
            },
            {
              id: 'w_sub',
              type: 'Text',
              props: {
                text: 'Otomasyon, analitik ve ekip işbirliği — kurulum dakikalar sürer.',
                className: 'text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl',
              },
            },
            {
              id: 'w_btns',
              type: 'Grid',
              props: { className: 'flex flex-wrap justify-center gap-3 mt-2' },
              children: [
                {
                  id: 'w_b1',
                  type: 'Button',
                  props: {
                    text: 'Ücretsiz başla',
                    href: '#',
                    className: 'px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-700',
                  },
                },
                {
                  id: 'w_b2',
                  type: 'Button',
                  props: {
                    text: 'Demo izle',
                    href: '#',
                    className: 'px-8 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-100 dark:hover:bg-slate-900',
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'w_trust',
          type: 'Container',
          props: { className: 'max-w-6xl mx-auto px-6 pb-12' },
          children: [
            {
              id: 'w_trt',
              type: 'Text',
              props: {
                text: 'Güvenilen markalar',
                className: 'text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6',
              },
            },
            {
              id: 'w_logos',
              type: 'Grid',
              props: { className: 'grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm font-semibold text-slate-500' },
              children: [
                { id: 'w_g1', type: 'Text', props: { text: 'ACME', className: 'py-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800' } },
                { id: 'w_g2', type: 'Text', props: { text: 'NORTH', className: 'py-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800' } },
                { id: 'w_g3', type: 'Text', props: { text: 'ORBIT', className: 'py-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800' } },
                { id: 'w_g4', type: 'Text', props: { text: 'PULSE', className: 'py-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800' } },
              ],
            },
          ],
        },
        {
          id: 'w_feat',
          type: 'Grid',
          props: { className: 'max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6' },
          children: [
            {
              id: 'w_c1',
              type: 'Card',
              props: { className: 'p-6' },
              children: [
                { id: 'w_c1h', type: 'Heading', props: { text: 'Gerçek zamanlı', level: 'h3', className: 'text-lg font-bold mb-2' } },
                { id: 'w_c1t', type: 'Text', props: { text: 'Canlı panolar ve uyarılar ile her zaman güncel kalın.', className: 'text-sm text-slate-600 dark:text-slate-400' } },
              ],
            },
            {
              id: 'w_c2',
              type: 'Card',
              props: { className: 'p-6' },
              children: [
                { id: 'w_c2h', type: 'Heading', props: { text: 'Güvenli', level: 'h3', className: 'text-lg font-bold mb-2' } },
                { id: 'w_c2t', type: 'Text', props: { text: 'Kurumsal SSO ve denetim günlükleri hazır.', className: 'text-sm text-slate-600 dark:text-slate-400' } },
              ],
            },
            {
              id: 'w_c3',
              type: 'Card',
              props: { className: 'p-6' },
              children: [
                { id: 'w_c3h', type: 'Heading', props: { text: 'API', level: 'h3', className: 'text-lg font-bold mb-2' } },
                { id: 'w_c3t', type: 'Text', props: { text: 'REST ve webhooks ile mevcut araçlarınıza bağlayın.', className: 'text-sm text-slate-600 dark:text-slate-400' } },
              ],
            },
          ],
        },
        {
          id: 'w_dark',
          type: 'Container',
          props: { className: 'mt-8 bg-slate-900 text-white py-16 px-6' },
          children: [
            {
              id: 'w_din',
              type: 'Container',
              props: { className: 'max-w-3xl mx-auto text-center flex flex-col gap-4' },
              children: [
                {
                  id: 'w_dh',
                  type: 'Heading',
                  props: { text: 'Bugün denemeye başlayın', level: 'h2', className: 'text-3xl font-bold' },
                },
                {
                  id: 'w_dt',
                  type: 'Text',
                  props: { text: 'Kredi kartı gerekmez. İstediğiniz zaman iptal edin.', className: 'text-slate-300' },
                },
                {
                  id: 'w_db',
                  type: 'Button',
                  props: {
                    text: 'Hesap oluştur',
                    href: '#',
                    className: 'mx-auto px-8 py-3 rounded-xl bg-indigo-500 font-semibold hover:bg-indigo-400',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'portfolio',
    name: 'Portfolyo / vitrin',
    description: 'Minimal başlık + proje ızgarası.',
    canvasState: {
      id: 'root',
      type: 'Section',
      props: { className: 'w-full min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100' },
      children: [
        {
          id: 'p_nav',
          type: 'Container',
          props: { className: 'max-w-5xl mx-auto px-6 py-8 flex justify-between items-center' },
          children: [
            { id: 'p_n1', type: 'Heading', props: { text: 'Ada Studio', level: 'h2', className: 'text-lg font-bold' } },
            { id: 'p_n2', type: 'Link', props: { text: 'İletişim', href: '#', className: 'text-sm' } },
          ],
        },
        {
          id: 'p_hero',
          type: 'Container',
          props: { className: 'max-w-5xl mx-auto px-6 py-16' },
          children: [
            {
              id: 'p_h1',
              type: 'Heading',
              props: { text: 'Dijital ürünler & arayüz tasarımı', level: 'h1', className: 'text-4xl md:text-5xl font-black tracking-tight' },
            },
            {
              id: 'p_h2',
              type: 'Text',
              props: {
                text: 'Seçili işlerimden örnekler. Metin ve görselleri kendi projelerinizle değiştirin.',
                className: 'mt-6 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl',
              },
            },
          ],
        },
        {
          id: 'p_grid',
          type: 'Grid',
          props: { className: 'max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 sm:grid-cols-2 gap-6' },
          children: [
            { id: 'p_i1', type: 'Image', props: { src: 'https://picsum.photos/seed/p1/800/600', className: 'rounded-2xl border border-zinc-200 dark:border-zinc-800' } },
            { id: 'p_i2', type: 'Image', props: { src: 'https://picsum.photos/seed/p2/800/600', className: 'rounded-2xl border border-zinc-200 dark:border-zinc-800' } },
            { id: 'p_i3', type: 'Image', props: { src: 'https://picsum.photos/seed/p3/800/600', className: 'rounded-2xl border border-zinc-200 dark:border-zinc-800' } },
            { id: 'p_i4', type: 'Image', props: { src: 'https://picsum.photos/seed/p4/800/600', className: 'rounded-2xl border border-zinc-200 dark:border-zinc-800' } },
          ],
        },
      ],
    },
  },
  {
    id: 'restaurant',
    name: 'Restoran / yerel iş',
    description: 'Sıcak tonlar, menü ve rezervasyon.',
    canvasState: {
      id: 'root',
      type: 'Section',
      props: { className: 'w-full min-h-screen bg-amber-50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-50' },
      children: [
        {
          id: 'r_hero',
          type: 'Container',
          props: { className: 'max-w-4xl mx-auto px-6 pt-16 pb-8 text-center' },
          children: [
            { id: 'r_h', type: 'Heading', props: { text: 'Bahçe Lokantası', level: 'h1', className: 'text-5xl font-serif font-bold' } },
            { id: 'r_s', type: 'Text', props: { text: 'Ev yapımı meze · odun fırını · her gün taze', className: 'mt-4 text-lg opacity-90' } },
            {
              id: 'r_b',
              type: 'Button',
              props: {
                text: 'Rezervasyon',
                href: '#',
                className: 'mt-8 px-8 py-3 rounded-full bg-amber-900 text-amber-50 font-semibold hover:bg-amber-800',
              },
            },
          ],
        },
        {
          id: 'r_row',
          type: 'Grid',
          props: { className: 'max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10 items-start' },
          children: [
            {
              id: 'r_m',
              type: 'Card',
              props: { className: 'p-6 bg-white/80 dark:bg-black/40 border border-amber-200/60 dark:border-amber-800/40' },
              children: [
                { id: 'r_mh', type: 'Heading', props: { text: 'Menü', level: 'h2', className: 'text-2xl font-bold mb-4' } },
                { id: 'r_m1', type: 'Text', props: { text: 'Çoban salata · Mercimek çorbası · Izgara levrek', className: 'text-sm leading-relaxed' } },
              ],
            },
            {
              id: 'r_img',
              type: 'Image',
              props: { src: 'https://picsum.photos/seed/rest/700/500', className: 'rounded-2xl shadow-lg w-full' },
            },
          ],
        },
      ],
    },
  },
  {
    id: 'blog-article',
    name: 'Blog / makale',
    description: 'Başlık, özet ve okunaklı gövde metni.',
    canvasState: {
      id: 'root',
      type: 'Section',
      props: { className: 'w-full min-h-screen bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200' },
      children: [
        {
          id: 'b_wrap',
          type: 'Container',
          props: { className: 'max-w-2xl mx-auto px-6 py-12 md:py-16' },
          children: [
            { id: 'b_cat', type: 'Text', props: { text: 'Kategori · 8 dk okuma', className: 'text-xs font-semibold uppercase tracking-wider text-indigo-600' } },
            {
              id: 'b_t',
              type: 'Heading',
              props: {
                text: 'Web sitenizi neden sıfırdan kurmalısınız?',
                level: 'h1',
                className: 'mt-4 text-3xl md:text-4xl font-bold leading-tight',
              },
            },
            { id: 'b_meta', type: 'Text', props: { text: 'Yazar: Editör · 15 Nisan 2026', className: 'mt-4 text-sm text-zinc-500' } },
            {
              id: 'b_p1',
              type: 'Text',
              props: {
                text: 'Hazır şablonlarla başlamak, hem süreyi kısaltır hem de tutarlı bir görünüm sağlar. Bu sayfayı kendi markanıza göre düzenleyin: başlıkları, paragrafları ve bağlantıları değiştirmeniz yeterli.',
                className: 'mt-8 text-lg leading-relaxed',
              },
            },
            {
              id: 'b_p2',
              type: 'Text',
              props: {
                text: 'İkinci paragrafta detay verin: veriler, alıntılar veya liste eklemek için sol panelden yeni bileşenler sürükleyebilirsiniz.',
                className: 'mt-6 text-base leading-relaxed text-zinc-600 dark:text-zinc-400',
              },
            },
            {
              id: 'b_p3',
              type: 'Text',
              props: {
                text: 'Sonuç olarak okuyucuya net bir çağrı bırakın — örneğin aşağıdaki düğme ile bültene kayıt veya iletişim sayfasına yönlendirin.',
                className: 'mt-6 text-base leading-relaxed text-zinc-600 dark:text-zinc-400',
              },
            },
            {
              id: 'b_btn',
              type: 'Button',
              props: {
                text: 'Tüm yazılar',
                href: '#',
                className: 'mt-10 px-6 py-3 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium',
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: 'pricing-3',
    name: 'Fiyatlandırma (3 plan)',
    description: 'Üç sütun fiyat kartı + SSS alanı.',
    canvasState: {
      id: 'root',
      type: 'Section',
      props: { className: 'w-full min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900' },
      children: [
        {
          id: 'pr_top',
          type: 'Container',
          props: { className: 'max-w-5xl mx-auto px-6 pt-16 text-center' },
          children: [
            { id: 'pr_h', type: 'Heading', props: { text: 'Basit fiyatlar', level: 'h1', className: 'text-4xl font-extrabold' } },
            { id: 'pr_sub', type: 'Text', props: { text: 'İhtiyacınıza göre yükseltin veya düşürün.', className: 'mt-3 text-slate-600 dark:text-slate-400' } },
          ],
        },
        {
          id: 'pr_cards',
          type: 'Grid',
          props: { className: 'max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6' },
          children: [
            {
              id: 'pr_k1',
              type: 'Card',
              props: { className: 'p-8 flex flex-col gap-4 border border-slate-200 dark:border-slate-700' },
              children: [
                { id: 'pr_k1t', type: 'Heading', props: { text: 'Başlangıç', level: 'h3', className: 'text-lg font-bold' } },
                { id: 'pr_k1p', type: 'Text', props: { text: '₺0 / ay', className: 'text-3xl font-black text-slate-900 dark:text-white' } },
                { id: 'pr_k1d', type: 'Text', props: { text: '1 site · temel bileşenler', className: 'text-sm text-slate-500' } },
                { id: 'pr_k1b', type: 'Button', props: { text: 'Seç', href: '#', className: 'mt-auto w-full py-2 rounded-lg border font-semibold' } },
              ],
            },
            {
              id: 'pr_k2',
              type: 'Card',
              props: { className: 'p-8 flex flex-col gap-4 border-2 border-indigo-600 shadow-xl scale-[1.02]' },
              children: [
                { id: 'pr_k2t', type: 'Heading', props: { text: 'Ekip', level: 'h3', className: 'text-lg font-bold text-indigo-600' } },
                { id: 'pr_k2p', type: 'Text', props: { text: '₺499 / ay', className: 'text-3xl font-black' } },
                { id: 'pr_k2d', type: 'Text', props: { text: 'Sınırsız sayfa · öncelikli destek', className: 'text-sm text-slate-500' } },
                { id: 'pr_k2b', type: 'Button', props: { text: 'Popüler plan', href: '#', className: 'mt-auto w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold' } },
              ],
            },
            {
              id: 'pr_k3',
              type: 'Card',
              props: { className: 'p-8 flex flex-col gap-4 border border-slate-200 dark:border-slate-700' },
              children: [
                { id: 'pr_k3t', type: 'Heading', props: { text: 'Kurumsal', level: 'h3', className: 'text-lg font-bold' } },
                { id: 'pr_k3p', type: 'Text', props: { text: 'Özel', className: 'text-3xl font-black' } },
                { id: 'pr_k3d', type: 'Text', props: { text: 'SLA · SSO · özel entegrasyon', className: 'text-sm text-slate-500' } },
                { id: 'pr_k3b', type: 'Button', props: { text: 'Satışla konuş', href: '#', className: 'mt-auto w-full py-2 rounded-lg border font-semibold' } },
              ],
            },
          ],
        },
        {
          id: 'pr_faq',
          type: 'Container',
          props: { className: 'max-w-3xl mx-auto px-6 pb-20' },
          children: [
            { id: 'pr_fh', type: 'Heading', props: { text: 'Sık sorulanlar', level: 'h2', className: 'text-2xl font-bold mb-6' } },
            { id: 'pr_f1', type: 'Text', props: { text: 'İptal politikası nedir? — İstediğiniz ay sonunda iptal edebilirsiniz.', className: 'text-sm border-b border-slate-200 dark:border-slate-700 py-3' } },
            { id: 'pr_f2', type: 'Text', props: { text: 'Verilerim nerede tutulur? — Avrupa bölgesi seçilebilir.', className: 'text-sm border-b border-slate-200 dark:border-slate-700 py-3' } },
            { id: 'pr_f3', type: 'Text', props: { text: 'Öğrenci indirimi var mı? — Evet, iletişime geçin.', className: 'text-sm py-3' } },
          ],
        },
      ],
    },
  },
];
