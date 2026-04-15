/**
 * Hazır blok şablonları (id’ler insert sırasında store’da yenilenir).
 * Kök: Section veya Container — çoğu ebeveyn altına eklenebilir.
 */

export const PRESET_BLOCKS = [
  {
    id: 'cta-banner',
    label: 'CTA şeridi',
    hint: 'Başlık + kısa metin + iki düğme',
    root: {
      id: '_preset',
      type: 'Container',
      props: {
        className:
          'rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600 p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-white shadow-lg',
      },
      children: [
        {
          id: '_p1',
          type: 'Container',
          props: { className: 'flex flex-col gap-2 min-w-0' },
          children: [
            {
              id: '_p2',
              type: 'Heading',
              props: {
                text: 'Projeyi bugün başlatın',
                level: 'h2',
                className: 'text-2xl md:text-3xl font-bold tracking-tight',
              },
            },
            {
              id: '_p3',
              type: 'Text',
              props: {
                text: 'Dakikalar içinde yayına hazır sayfalar oluşturun; kod gerekmez.',
                className: 'text-blue-100 text-sm md:text-base max-w-xl',
              },
            },
          ],
        },
        {
          id: '_p4',
          type: 'Grid',
          props: { className: 'flex flex-wrap gap-3 shrink-0' },
          children: [
            {
              id: '_p5',
              type: 'Button',
              props: {
                text: 'Ücretsiz dene',
                href: '#',
                className: 'px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow hover:bg-blue-50',
              },
            },
            {
              id: '_p6',
              type: 'Button',
              props: {
                text: 'Canlı demo',
                href: '#',
                className: 'px-6 py-3 border-2 border-white/80 text-white font-semibold rounded-lg hover:bg-white/10',
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
];
