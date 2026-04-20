/**
 * Hazır blok şablonları (id’ler insert sırasında store’da yenilenir).
 * Kök: Section veya Container — çoğu ebeveyn altına eklenebilir.
 */

export const PRESET_BLOCKS = [
  {
    id: 'cta-banner',
    label: 'CTA şeridi',
    hint: 'Tam genişlik çağrı kutusu — başlık, metin, iki düğme (flex)',
    root: {
      id: '_preset',
      type: 'Container',
      props: {
        className:
          'w-full overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-6 py-8 text-white shadow-2xl shadow-blue-950/40 sm:px-10 sm:py-10 md:px-12 md:py-12',
      },
      children: [
        {
          id: '_p-row',
          type: 'Container',
          props: {
            className:
              'flex flex-col items-stretch gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10',
          },
          children: [
            {
              id: '_p1',
              type: 'Container',
              props: { className: 'flex min-w-0 flex-1 flex-col gap-3 text-left' },
              children: [
                {
                  id: '_p2',
                  type: 'Heading',
                  props: {
                    text: 'Hazır mısınız? Bir sonraki kampanyanızı buradan başlatın.',
                    level: 'h2',
                    className: 'text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl',
                  },
                },
                {
                  id: '_p3',
                  type: 'Text',
                  props: {
                    text: 'Ekibinizle aynı projede çalışın, önizleyin ve tek tıkla dışa aktarın. Kredi kartı gerekmez.',
                    className: 'max-w-xl text-sm leading-relaxed text-blue-100 sm:text-base',
                  },
                },
              ],
            },
            {
              id: '_p4',
              type: 'Container',
              props: {
                className:
                  'flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end',
              },
              children: [
                {
                  id: '_p5',
                  type: 'Button',
                  props: {
                    text: 'Ücretsiz dene',
                    href: '#',
                    className:
                      'inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-800 shadow-md transition hover:bg-blue-50 sm:w-auto whitespace-nowrap',
                  },
                },
                {
                  id: '_p6',
                  type: 'Button',
                  props: {
                    text: 'Satışla görüş',
                    href: '#',
                    className:
                      'inline-flex w-full items-center justify-center rounded-xl border-2 border-white/70 bg-transparent px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto whitespace-nowrap',
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
    id: 'faq-3',
    label: 'SSS (3 soru)',
    hint: 'Sıkça sorulan sorular — başlık ve üç soru/cevap satırı',
    root: {
      id: '_preset',
      type: 'Container',
      props: {
        className:
          'w-full max-w-2xl mx-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 overflow-hidden',
      },
      children: [
        {
          id: '_faq-h',
          type: 'Heading',
          props: {
            text: 'Sıkça sorulan sorular',
            level: 'h2',
            className: 'px-6 pt-6 pb-2 text-xl font-bold text-gray-900 dark:text-white',
          },
        },
        {
          id: '_faq1',
          type: 'Container',
          props: {
            className: 'px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-1',
          },
          children: [
            {
              id: '_faq1q',
              type: 'Heading',
              props: {
                text: 'Kod bilmem gerekir mi?',
                level: 'h3',
                className: 'text-sm font-semibold text-gray-900 dark:text-white',
              },
            },
            {
              id: '_faq1a',
              type: 'Text',
              props: {
                text: 'Hayır. Bileşenleri sürükleyip metin ve sınıfları düzenlemeniz yeterli.',
                className: 'text-sm text-gray-600 dark:text-gray-400 leading-relaxed',
              },
            },
          ],
        },
        {
          id: '_faq2',
          type: 'Container',
          props: {
            className: 'px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-1',
          },
          children: [
            {
              id: '_faq2q',
              type: 'Heading',
              props: {
                text: 'Dışa aktarılan site nerede çalışır?',
                level: 'h3',
                className: 'text-sm font-semibold text-gray-900 dark:text-white',
              },
            },
            {
              id: '_faq2a',
              type: 'Text',
              props: {
                text: 'HTML veya zip dosyası herhangi bir statik barındırmada; Netlify/Vercel ile de tek tıkla yayınlayabilirsiniz.',
                className: 'text-sm text-gray-600 dark:text-gray-400 leading-relaxed',
              },
            },
          ],
        },
        {
          id: '_faq3',
          type: 'Container',
          props: {
            className: 'px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-1 pb-6',
          },
          children: [
            {
              id: '_faq3q',
              type: 'Heading',
              props: {
                text: 'Verilerim nerede saklanır?',
                level: 'h3',
                className: 'text-sm font-semibold text-gray-900 dark:text-white',
              },
            },
            {
              id: '_faq3a',
              type: 'Text',
              props: {
                text: 'Kendi sunucunuzdaki API ve MongoDB veya dosya tabanlı depolama ile; kontrol sizde.',
                className: 'text-sm text-gray-600 dark:text-gray-400 leading-relaxed',
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: 'features-3',
    label: '3 özellik kartı',
    hint: 'Yan yana üç kart',
    root: {
      id: '_preset',
      type: 'Grid',
      props: {
        className: 'grid grid-cols-1 md:grid-cols-3 gap-6 w-full',
      },
      children: [
        {
          id: '_f1',
          type: 'Card',
          props: { className: 'p-6 flex flex-col gap-3' },
          children: [
            {
              id: '_f1h',
              type: 'Heading',
              props: { text: 'Hızlı', level: 'h3', className: 'text-lg font-bold text-gray-900 dark:text-white' },
            },
            {
              id: '_f1t',
              type: 'Text',
              props: {
                text: 'Sürükle-bırak ile düzen; anında önizleme.',
                className: 'text-sm text-gray-600 dark:text-gray-400',
              },
            },
          ],
        },
        {
          id: '_f2',
          type: 'Card',
          props: { className: 'p-6 flex flex-col gap-3' },
          children: [
            {
              id: '_f2h',
              type: 'Heading',
              props: { text: 'Esnek', level: 'h3', className: 'text-lg font-bold text-gray-900 dark:text-white' },
            },
            {
              id: '_f2t',
              type: 'Text',
              props: {
                text: 'Tailwind sınıfları ile tasarımı ince ayarlayın.',
                className: 'text-sm text-gray-600 dark:text-gray-400',
              },
            },
          ],
        },
        {
          id: '_f3',
          type: 'Card',
          props: { className: 'p-6 flex flex-col gap-3' },
          children: [
            {
              id: '_f3h',
              type: 'Heading',
              props: { text: 'Yayın', level: 'h3', className: 'text-lg font-bold text-gray-900 dark:text-white' },
            },
            {
              id: '_f3t',
              type: 'Text',
              props: {
                text: 'HTML veya canlı görünüm ile paylaşın.',
                className: 'text-sm text-gray-600 dark:text-gray-400',
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: 'testimonial',
    label: 'Referans',
    hint: 'Alıntı + imza',
    root: {
      id: '_preset',
      type: 'Card',
      props: {
        className: 'p-8 max-w-2xl mx-auto border-l-4 border-blue-500 bg-gray-50 dark:bg-gray-900/80',
      },
      children: [
        {
          id: '_t1',
          type: 'Text',
          props: {
            text: '“Ekibimiz bir günde müşteri sayfasını yayına aldı. Arayüz çok sezgisel.”',
            className: 'text-lg text-gray-800 dark:text-gray-100 italic leading-relaxed',
          },
        },
        {
          id: '_t2',
          type: 'Text',
          props: {
            text: '— Ayşe Y., Ürün Müdürü',
            className: 'mt-4 text-sm font-semibold text-gray-600 dark:text-gray-400',
          },
        },
      ],
    },
  },
  {
    id: 'pricing-row',
    label: 'Fiyat kutusu',
    hint: 'Tek plan kartı',
    root: {
      id: '_preset',
      type: 'Container',
      props: {
        className:
          'max-w-sm mx-auto rounded-2xl border-2 border-blue-500 bg-white dark:bg-gray-950 p-8 shadow-xl flex flex-col gap-4 text-center',
      },
      children: [
        {
          id: '_pr1',
          type: 'Heading',
          props: { text: 'Pro', level: 'h3', className: 'text-xl font-bold text-gray-900 dark:text-white' },
        },
        {
          id: '_pr2',
          type: 'Text',
          props: {
            text: '₺299 / ay',
            className: 'text-3xl font-black text-blue-600 dark:text-blue-400',
          },
        },
        {
          id: '_pr3',
          type: 'Text',
          props: {
            text: 'Sınırsız sayfa · Öncelikli destek · Özel alan adı',
            className: 'text-sm text-gray-600 dark:text-gray-400',
          },
        },
        {
          id: '_pr4',
          type: 'Button',
          props: {
            text: 'Planı seç',
            href: '#',
            className: 'mt-2 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700',
          },
        },
      ],
    },
  },
  {
    id: 'stats-row',
    label: 'İstatistik şeridi',
    hint: '3 sayı + açıklama',
    root: {
      id: '_preset',
      type: 'Grid',
      props: { className: 'grid grid-cols-1 sm:grid-cols-3 gap-6 w-full' },
      children: [
        {
          id: '_s1',
          type: 'Card',
          props: { className: 'p-6 text-center' },
          children: [
            { id: '_s1n', type: 'Heading', props: { text: '10K+', level: 'h3', className: 'text-3xl font-black text-indigo-600' } },
            { id: '_s1t', type: 'Text', props: { text: 'Aktif kullanıcı', className: 'text-sm text-gray-500 mt-1' } },
          ],
        },
        {
          id: '_s2',
          type: 'Card',
          props: { className: 'p-6 text-center' },
          children: [
            { id: '_s2n', type: 'Heading', props: { text: '99.9%', level: 'h3', className: 'text-3xl font-black text-indigo-600' } },
            { id: '_s2t', type: 'Text', props: { text: 'Çalışma süresi', className: 'text-sm text-gray-500 mt-1' } },
          ],
        },
        {
          id: '_s3',
          type: 'Card',
          props: { className: 'p-6 text-center' },
          children: [
            { id: '_s3n', type: 'Heading', props: { text: '24/7', level: 'h3', className: 'text-3xl font-black text-indigo-600' } },
            { id: '_s3t', type: 'Text', props: { text: 'Destek', className: 'text-sm text-gray-500 mt-1' } },
          ],
        },
      ],
    },
  },
  {
    id: 'newsletter',
    label: 'Bülten kaydı',
    hint: 'Başlık + e-posta alanı + gönder',
    root: {
      id: '_preset',
      type: 'Container',
      props: {
        className:
          'rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-8 flex flex-col md:flex-row md:items-end gap-4',
      },
      children: [
        {
          id: '_n1',
          type: 'Container',
          props: { className: 'flex-1 flex flex-col gap-2' },
          children: [
            { id: '_n1h', type: 'Heading', props: { text: 'Bültene katılın', level: 'h3', className: 'text-lg font-bold' } },
            { id: '_n1t', type: 'Text', props: { text: 'Haftalık ipuçları, spam yok.', className: 'text-sm text-gray-600 dark:text-gray-400' } },
          ],
        },
        {
          id: '_n2',
          type: 'Grid',
          props: { className: 'flex flex-col sm:flex-row gap-2 w-full md:w-auto' },
          children: [
            {
              id: '_n2i',
              type: 'Text',
              props: {
                text: 'ornek@email.com',
                className: 'px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950 text-sm text-gray-400',
              },
            },
            {
              id: '_n2b',
              type: 'Button',
              props: {
                text: 'Abone ol',
                href: '#',
                className: 'px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold whitespace-nowrap',
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: 'footer-mini',
    label: 'Alt bilgi (mini)',
    hint: '4 sütun link metni',
    root: {
      id: '_preset',
      type: 'Container',
      props: {
        className:
          'border-t border-gray-200 dark:border-gray-800 pt-10 pb-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-gray-600 dark:text-gray-400',
      },
      children: [
        { id: '_f1', type: 'Text', props: { text: 'Ürün\nÖzellikler\nFiyatlar', className: 'whitespace-pre-line' } },
        { id: '_f2', type: 'Text', props: { text: 'Şirket\nHakkımızda\nKariyer', className: 'whitespace-pre-line' } },
        { id: '_f3', type: 'Text', props: { text: 'Kaynaklar\nBlog\nYardım', className: 'whitespace-pre-line' } },
        { id: '_f4', type: 'Text', props: { text: 'Yasal\nGizlilik\nKoşullar', className: 'whitespace-pre-line' } },
      ],
    },
  },
  {
    id: 'two-column',
    label: 'İki sütun',
    hint: 'Metin + görsel yan yana',
    root: {
      id: '_preset',
      type: 'Grid',
      props: { className: 'grid md:grid-cols-2 gap-8 items-center w-full' },
      children: [
        {
          id: '_2c1',
          type: 'Container',
          props: { className: 'flex flex-col gap-4' },
          children: [
            { id: '_2h', type: 'Heading', props: { text: 'Hikayenizi anlatın', level: 'h2', className: 'text-2xl font-bold' } },
            {
              id: '_2t',
              type: 'Text',
              props: {
                text: 'Bu metni kendi değer önerinizle değiştirin. Görselleri sağdaki kutudan güncelleyebilirsiniz.',
                className: 'text-gray-600 dark:text-gray-400 leading-relaxed',
              },
            },
            { id: '_2b', type: 'Button', props: { text: 'Detaylar', href: '#', className: 'self-start px-5 py-2 rounded-lg border font-medium' } },
          ],
        },
        {
          id: '_2img',
          type: 'Image',
          props: { src: 'https://picsum.photos/seed/twocol/700/480', className: 'rounded-xl w-full shadow-md' },
        },
      ],
    },
  },
  {
    id: 'faq-simple',
    label: 'SSS listesi',
    hint: 'Başlık + soru satırları',
    root: {
      id: '_preset',
      type: 'Container',
      props: { className: 'max-w-2xl flex flex-col gap-0' },
      children: [
        { id: '_fqh', type: 'Heading', props: { text: 'Sık sorulanlar', level: 'h2', className: 'text-xl font-bold mb-4' } },
        { id: '_fq1', type: 'Text', props: { text: 'Deneme süresi var mı? — Evet, 14 gün.', className: 'py-3 border-b border-gray-200 dark:border-gray-800 text-sm' } },
        { id: '_fq2', type: 'Text', props: { text: 'Ödeme yöntemleri? — Kredi kartı ve havale.', className: 'py-3 border-b border-gray-200 dark:border-gray-800 text-sm' } },
        { id: '_fq3', type: 'Text', props: { text: 'İade politikası? — 30 gün içinde koşulsuz.', className: 'py-3 text-sm' } },
      ],
    },
  },
  {
    id: 'team-two',
    label: '2 kişi ekibi',
    hint: 'Kart + isim + rol',
    root: {
      id: '_preset',
      type: 'Grid',
      props: { className: 'grid sm:grid-cols-2 gap-6 w-full' },
      children: [
        {
          id: '_tm1',
          type: 'Card',
          props: { className: 'p-6 flex flex-col items-center text-center gap-3' },
          children: [
            { id: '_tm1i', type: 'Image', props: { src: 'https://picsum.photos/seed/t1/120/120', className: 'rounded-full w-24 h-24 object-cover' } },
            { id: '_tm1n', type: 'Heading', props: { text: 'Zeynep K.', level: 'h3', className: 'text-lg font-bold' } },
            { id: '_tm1r', type: 'Text', props: { text: 'Ürün tasarımı', className: 'text-sm text-gray-500' } },
          ],
        },
        {
          id: '_tm2',
          type: 'Card',
          props: { className: 'p-6 flex flex-col items-center text-center gap-3' },
          children: [
            { id: '_tm2i', type: 'Image', props: { src: 'https://picsum.photos/seed/t2/120/120', className: 'rounded-full w-24 h-24 object-cover' } },
            { id: '_tm2n', type: 'Heading', props: { text: 'Can D.', level: 'h3', className: 'text-lg font-bold' } },
            { id: '_tm2r', type: 'Text', props: { text: 'Mühendislik', className: 'text-sm text-gray-500' } },
          ],
        },
      ],
    },
  },
  {
    id: 'logos-strip',
    label: 'Logo şeridi',
    hint: 'Yatay marka yazıları',
    root: {
      id: '_preset',
      type: 'Container',
      props: {
        className: 'flex flex-wrap justify-center gap-8 py-6 px-4 border-y border-gray-200 dark:border-gray-800 text-gray-400 font-semibold text-sm tracking-widest',
      },
      children: [
        { id: '_lg1', type: 'Text', props: { text: 'VERTEX' } },
        { id: '_lg2', type: 'Text', props: { text: 'NIMBUS' } },
        { id: '_lg3', type: 'Text', props: { text: 'ARC' } },
        { id: '_lg4', type: 'Text', props: { text: 'HELIX' } },
        { id: '_lg5', type: 'Text', props: { text: 'FORGE' } },
      ],
    },
  },
  {
    id: 'divider',
    label: 'Ayırıcı boşluk',
    hint: 'Dikey nefes alanı',
    root: {
      id: '_preset',
      type: 'Container',
      props: { className: 'w-full h-16 md:h-24 shrink-0' },
      children: [],
    },
  },
  {
    id: 'video-placeholder',
    label: 'Video / görsel alanı',
    hint: 'Geniş görsel + başlık',
    root: {
      id: '_preset',
      type: 'Container',
      props: { className: 'flex flex-col gap-4' },
      children: [
        {
          id: '_vp1',
          type: 'Image',
          props: { src: 'https://picsum.photos/seed/video/1200/640', className: 'rounded-2xl w-full aspect-video object-cover' },
        },
        { id: '_vp2', type: 'Text', props: { text: 'Ürün turu veya tanıtım videosu için başlığı düzenleyin.', className: 'text-center text-sm text-gray-500' } },
      ],
    },
  },
];
