import { create } from 'zustand';
import { normalizePageSettings } from '../lib/pageSettingsDefaults.js';

// Ürün sayfası benzeri açılış: nav + hero + net CTA (flex Container; Grid yalnızca ızgara için)
const initialCanvas = {
  id: 'root',
  type: 'Section',
  props: {
    className:
      'w-full min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100 font-sans',
  },
  children: [
    {
      id: 'navbar-1',
      type: 'Container',
      props: {
        className:
          'max-w-6xl mx-auto px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm',
      },
      children: [
        {
          id: 'logo-text',
          type: 'Heading',
          props: {
            text: 'Markanız',
            className: 'text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white',
            level: 'h2',
          },
        },
        {
          id: 'nav-links',
          type: 'Container',
          props: {
            className: 'hidden sm:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400',
          },
          children: [
            {
              id: 'nav-l1',
              type: 'Link',
              props: { text: 'Özellikler', href: '#ozellikler', className: 'no-underline hover:text-slate-900 dark:hover:text-white' },
            },
            {
              id: 'nav-l2',
              type: 'Link',
              props: { text: 'Fiyatlandırma', href: '#fiyat', className: 'no-underline hover:text-slate-900 dark:hover:text-white' },
            },
          ],
        },
        {
          id: 'nav-btn',
          type: 'Button',
          props: {
            text: 'Panele git',
            href: '#',
            className:
              'inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors whitespace-nowrap',
          },
        },
      ],
    },
    {
      id: 'hero-section',
      type: 'Container',
      props: {
        className:
          'max-w-6xl mx-auto px-5 sm:px-6 py-16 md:py-24 flex flex-col items-center text-center gap-6 md:gap-8',
      },
      children: [
        {
          id: 'hero-badge',
          type: 'Text',
          props: {
            text: 'Yeni · Kurumsal ekip planları',
            className:
              'inline-block rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400',
          },
        },
        {
          id: 'hero-title',
          type: 'Heading',
          props: {
            text: 'Web sitenizi dakikalar içinde yayına alın',
            className:
              'max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl leading-[1.1]',
            level: 'h1',
          },
        },
        {
          id: 'hero-subtitle',
          type: 'Text',
          props: {
            text: 'Görsel düzenleyici, hazır bloklar ve dışa aktarma ile ekip arkadaşlarınıza sunulabilir sayfalar üretin — kod yazmadan.',
            className: 'max-w-2xl text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed',
          },
        },
        {
          id: 'hero-actions',
          type: 'Container',
          props: {
            className: 'mt-2 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center',
          },
          children: [
            {
              id: 'primary-btn',
              type: 'Button',
              props: {
                text: 'Ücretsiz başlayın',
                href: '#',
                className:
                  'inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-colors whitespace-nowrap',
              },
            },
            {
              id: 'secondary-btn',
              type: 'Button',
              props: {
                text: 'Demo inceleyin',
                href: '#',
                className:
                  'inline-flex items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap',
              },
            },
          ],
        },
      ],
    },
  ],
};

const cloneInitialCanvas = () => JSON.parse(JSON.stringify(initialCanvas));

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
    : Math.random().toString(36).slice(2, 11);

// Deep clone for duplication
const deepCloneNode = (node) => {
  return {
    ...node,
    id: generateId(),
    children: node.children ? node.children.map(deepCloneNode) : undefined
  };
};

/** Tam sayfa şablonu: kök id root kalır, alt ağaçta yeni id’ler */
function remapTreeKeepRoot(node, isRoot = true) {
  return {
    ...node,
    id: isRoot ? 'root' : generateId(),
    children: node.children?.map((c) => remapTreeKeepRoot(c, false)),
  };
}

const HISTORY_LIMIT = 80;

/** Canvas değişiminden hemen önce mevcut ağacı past'e yazar (geri al için). */
function pushPastAndMutate(state, partial) {
  const snap = JSON.parse(JSON.stringify(state.canvasState));
  return {
    ...partial,
    historyPast: [...state.historyPast, snap].slice(-HISTORY_LIMIT),
    historyFuture: [],
  };
}

export const useEditorStore = create((set, get) => ({
  canvasState: cloneInitialCanvas(),
  selectedElementId: null,
  currentPageId: null,
  pageName: 'Yeni sayfa',
  /** URL / SEO slug (kayıtta sunucuya gider) */
  pageSlug: '',
  /** Sunucudan gelen sayfa ayarları (dışa aktarma vb.) */
  pageSettings: normalizePageSettings({}),
  /** Canvas yakınlaştırma % (50–150) */
  canvasZoom: 100,
  /** Geri al / yinele (yalnızca canvasState) */
  historyPast: [],
  historyFuture: [],
  /** Önizleme genişliği — mobil / tablet / masaüstü (Tailwind breakpoint’leriyle uyumlu) */
  canvasViewport: 'desktop',
  /** Yerleşim ızgarası ve merkez kılavuzları (yalnızca editör görünümü) */
  showCanvasGrid: false,
  showCanvasGuides: false,

  setSelectedElement: (id) => set({ selectedElementId: id }),
  setPageName: (pageName) => set({ pageName }),
  setPageSlug: (pageSlug) => set({ pageSlug: typeof pageSlug === 'string' ? pageSlug : '' }),
  setCanvasZoom: (z) =>
    set(() => {
      const n = Number(z);
      if (Number.isNaN(n)) return {};
      return { canvasZoom: Math.min(150, Math.max(50, Math.round(n))) };
    }),

  setCanvasViewport: (canvasViewport) =>
    set(() =>
      ['mobile', 'tablet', 'desktop'].includes(canvasViewport) ? { canvasViewport } : {}
    ),

  toggleShowCanvasGrid: () => set((s) => ({ showCanvasGrid: !s.showCanvasGrid })),
  toggleShowCanvasGuides: () => set((s) => ({ showCanvasGuides: !s.showCanvasGuides })),

  undo: () =>
    set((state) => {
      if (state.historyPast.length === 0) return {};
      const prev = state.historyPast[state.historyPast.length - 1];
      const current = JSON.parse(JSON.stringify(state.canvasState));
      return {
        canvasState: JSON.parse(JSON.stringify(prev)),
        historyPast: state.historyPast.slice(0, -1),
        historyFuture: [current, ...state.historyFuture].slice(0, HISTORY_LIMIT),
      };
    }),

  redo: () =>
    set((state) => {
      if (state.historyFuture.length === 0) return {};
      const next = state.historyFuture[0];
      const current = JSON.parse(JSON.stringify(state.canvasState));
      return {
        canvasState: JSON.parse(JSON.stringify(next)),
        historyPast: [...state.historyPast, current].slice(-HISTORY_LIMIT),
        historyFuture: state.historyFuture.slice(1),
      };
    }),

  /** Sayfa ayarlarını kısmi güncelle (ör. kod editöründen customCSS) */
  updatePageSettings: (partial) =>
    set((state) => {
      const merged = { ...state.pageSettings, ...partial };
      if (partial?.theme && typeof partial.theme === 'object') {
        merged.theme = { ...state.pageSettings.theme, ...partial.theme };
      }
      return { pageSettings: normalizePageSettings(merged) };
    }),

  loadPage: (doc) =>
    set({
      canvasState: doc.canvasState,
      currentPageId: doc._id ? String(doc._id) : null,
      pageName: doc.name || 'Yeni sayfa',
      pageSlug: doc.slug != null && doc.slug !== '' ? String(doc.slug) : '',
      selectedElementId: null,
      pageSettings: normalizePageSettings(doc.settings),
      historyPast: [],
      historyFuture: [],
    }),

  resetEditor: () =>
    set({
      canvasState: cloneInitialCanvas(),
      selectedElementId: null,
      currentPageId: null,
      pageName: 'Yeni sayfa',
      pageSlug: '',
      pageSettings: normalizePageSettings({}),
      canvasZoom: 100,
      historyPast: [],
      historyFuture: [],
    }),

  /** İçe aktarılan JSON ile canvası değiştirir */
  replaceCanvasFromImport: (tree) => {
    if (!tree || typeof tree !== 'object') throw new Error('Geçersiz dosya');
    if (tree.id !== 'root') throw new Error('Kök öğe id "root" olmalı');
    if (!tree.type) throw new Error('Kök type eksik');
    set({
      canvasState: tree,
      selectedElementId: null,
      historyPast: [],
      historyFuture: [],
    });
  },

  /** Hazır website şablonu — id’ler yenilenir, kök seçilir */
  applyWebsiteTemplate: (tree) => {
    if (!tree || typeof tree !== 'object') throw new Error('Geçersiz şablon');
    if (tree.id !== 'root') throw new Error('Şablon kök id "root" olmalı');
    if (!tree.type) throw new Error('Kök type eksik');
    const copy = JSON.parse(JSON.stringify(tree));
    set({
      canvasState: remapTreeKeepRoot(copy, true),
      selectedElementId: 'root',
      historyPast: [],
      historyFuture: [],
    });
  },

  updateElementProps: (id, newProps) =>
    set((state) => {
      const updateRecursive = (node) => {
        if (node.id === id) {
          return { ...node, props: { ...node.props, ...newProps } };
        }
        if (node.children) {
          return { ...node, children: node.children.map(updateRecursive) };
        }
        return node;
      };
      const nextTree = updateRecursive(state.canvasState);
      return pushPastAndMutate(state, { canvasState: nextTree });
    }),

  // Tailwind Class Manipülatörü
  updateElementClass: (id, classPrefix, newClassValue) =>
    set((state) => {
      const updateRecursive = (node) => {
        if (node.id === id) {
          let currentClasses = node.props.className || '';
          // İlgili prefix ile başlayan (Örn: "bg-", "p-") bir class varsa onu kaldır. Regex kullanarak siliyoruz.
          // Uyarı: Basit bir regex yaklaışımı. 'bg-' yakalamak için boşluk ve string başı dikkate alınır.
          const regex = new RegExp(`(^|\\s)${classPrefix}[a-zA-Z0-9/-]+(\\s|$)`, 'g');
          currentClasses = currentClasses.replace(regex, ' ').trim();

          if (newClassValue) {
            currentClasses = `${currentClasses} ${newClassValue}`.trim();
          }

          return { ...node, props: { ...node.props, className: currentClasses } };
        }
        if (node.children) {
          return { ...node, children: node.children.map(updateRecursive) };
        }
        return node;
      };
      const nextTree = updateRecursive(state.canvasState);
      return pushPastAndMutate(state, { canvasState: nextTree });
    }),

  addElement: (parentId, componentType) => set((state) => {
    const newElement = {
      id: generateId(),
      type: componentType,
      props: { className: 'p-4 min-h-[50px] border border-dashed border-gray-300 dark:border-gray-700' },
      children: [],
    };
    if (componentType === 'Grid') {
      newElement.props.className =
        'grid min-h-[50px] grid-cols-1 gap-4 p-4 border border-dashed border-gray-300 dark:border-gray-700 sm:grid-cols-2';
    }
    if (componentType === 'Section') {
      newElement.props.className =
        'w-full py-10 px-4 min-h-[120px] border border-dashed border-gray-300 dark:border-gray-700';
    }
    if (componentType === 'Container') {
      newElement.props.className =
        'max-w-5xl mx-auto w-full p-6 min-h-[80px] border border-dashed border-gray-300 dark:border-gray-700 rounded-xl';
    }
    if (componentType === 'Card') {
      newElement.props.className =
        'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 min-h-[80px]';
    }
    if(componentType === 'Text') newElement.props.text = 'Metninizi buraya yazın.';
    if(componentType === 'Heading') { newElement.props.text = 'Başlık'; newElement.props.level = 'h2'; }
    if(componentType === 'Button') {
      newElement.props.text = 'İletişime geç';
      newElement.props.href = '#';
      newElement.props.targetBlank = false;
      newElement.props.className =
        'inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap';
    }
    if (componentType === 'Link') {
      newElement.props.text = 'Daha fazlası';
      newElement.props.href = 'https://';
      newElement.props.targetBlank = true;
    }
    if(componentType === 'Image') newElement.props.src = 'https://via.placeholder.com/150';

    const insertRecursive = (node) => {
      if (node.id === parentId) {
        const children = node.children ? [...node.children, newElement] : [newElement];
        return { ...node, children };
      }
      if (node.children) {
        return { ...node, children: node.children.map(insertRecursive) };
      }
      return node;
    };
    const nextTree = insertRecursive(state.canvasState);
    return pushPastAndMutate(state, { canvasState: nextTree });
  }),

  /** Hazır şablon ağacı ekler (tüm id’ler deepClone ile yenilenir); kök seçilir */
  insertSubtree: (parentId, subtreeTemplate) =>
    set((state) => {
      const raw = JSON.parse(JSON.stringify(subtreeTemplate));
      const cloned = deepCloneNode(raw);
      const insertRecursive = (node) => {
        if (node.id === parentId) {
          const children = node.children ? [...node.children, cloned] : [cloned];
          return { ...node, children };
        }
        if (node.children) {
          return { ...node, children: node.children.map(insertRecursive) };
        }
        return node;
      };
      const nextTree = insertRecursive(state.canvasState);
      return pushPastAndMutate(state, {
        canvasState: nextTree,
        selectedElementId: cloned.id,
      });
    }),

  removeElement: (id) =>
    set((state) => {
      if (id === 'root') return state; // Root silinemez
      const removeRecursive = (node) => {
        if (node.children) {
          const filteredChildren = node.children.filter((child) => child.id !== id);
          return { ...node, children: filteredChildren.map(removeRecursive) };
        }
        return node;
      };
      const nextTree = removeRecursive(state.canvasState);
      return pushPastAndMutate(state, {
        canvasState: nextTree,
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
      });
    }),

  /** Text/Image içine blok eklenmesin; geçerli ebeveyn id'si */
  findDropTargetParentId: (selectedId) => {
    const state = get();
    if (!selectedId) return 'root';
    const node = state.getElement(selectedId);
    if (!node) return 'root';
    // Bu tiplerin içine blok eklenmesin (button içinde button / geçersiz DOM önlenir)
    const insertAsSiblingInstead = ['Text', 'Image', 'Button', 'Link'];
    if (!insertAsSiblingInstead.includes(node.type)) return selectedId;
    const findParentId = (root, childId, parentId = null) => {
      if (root.id === childId) return parentId;
      if (root.children) {
        for (const c of root.children) {
          const found = findParentId(c, childId, root.id);
          if (found !== undefined) return found;
        }
      }
      return undefined;
    };
    return findParentId(state.canvasState, selectedId) ?? 'root';
  },

  duplicateElement: (id) => set((state) => {
    if (id === 'root') return state;
    
    let clonedNodeToInsert = null;

    const findAndDuplicateRecursive = (node) => {
      if (node.children) {
        const targetIndex = node.children.findIndex(child => child.id === id);
        if (targetIndex > -1) {
          const original = node.children[targetIndex];
          clonedNodeToInsert = deepCloneNode(original);
          
          const newChildren = [...node.children];
          newChildren.splice(targetIndex + 1, 0, clonedNodeToInsert);
          
          return { ...node, children: newChildren };
        }
        return { ...node, children: node.children.map(findAndDuplicateRecursive) };
      }
      return node;
    };

    const newState = findAndDuplicateRecursive(state.canvasState);
    return pushPastAndMutate(state, {
      canvasState: newState,
      selectedElementId: clonedNodeToInsert ? clonedNodeToInsert.id : state.selectedElementId,
    });
  }),

  /**
   * Kapsayıcı içinde tam konum (Figma tarzı aralık indeksi).
   * @param rawSlotIndex — Taşımadan önceki çocuk sırasına göre aralık: 0 = en üst, length = en alta (çocuk sayısı kadar aralık).
   *   Aynı ebeveyinde taşırken: kaynak silinmeden önceki görünür aralık indeksi.
   */
  moveElementToIndex: (sourceId, parentId, rawSlotIndex) => set((state) => {
    if (sourceId === 'root') return state;

    const CHILD_CONTAINER_TYPES = ['Section', 'Container', 'Grid', 'Card'];

    const subtreeHasId = (node, needleId) => {
      if (node.id === needleId) return true;
      return node.children?.some((c) => subtreeHasId(c, needleId)) ?? false;
    };

    const findParentAndIndex = (root, childId) => {
      if (root.children) {
        for (let i = 0; i < root.children.length; i += 1) {
          if (root.children[i].id === childId) return { parent: root, index: i };
          const found = findParentAndIndex(root.children[i], childId);
          if (found) return found;
        }
      }
      return null;
    };

    const findNodeById = (root, id) => {
      if (root.id === id) return root;
      for (const c of root.children || []) {
        const f = findNodeById(c, id);
        if (f) return f;
      }
      return null;
    };

    let sourceNode = null;
    const removeSourceRecursive = (node) => {
      if (node.children) {
        const idx = node.children.findIndex((child) => child.id === sourceId);
        if (idx > -1) {
          sourceNode = node.children[idx];
          node.children.splice(idx, 1);
          return;
        }
        node.children.forEach(removeSourceRecursive);
      }
    };

    const oldLoc = findParentAndIndex(state.canvasState, sourceId);
    if (!oldLoc) return state;

    let probe = null;
    const locateProbe = (node) => {
      if (node.id === sourceId) {
        probe = node;
        return;
      }
      node.children?.forEach(locateProbe);
    };
    locateProbe(state.canvasState);
    if (!probe) return state;
    if (subtreeHasId(probe, parentId)) return state;

    const parentBefore = findNodeById(state.canvasState, parentId);
    if (!parentBefore || !CHILD_CONTAINER_TYPES.includes(parentBefore.type)) return state;

    const n = parentBefore.children?.length ?? 0;
    let raw = Math.max(0, Math.min(rawSlotIndex, n));

    let insertIndex = raw;
    if (oldLoc.parent.id === parentId && raw > oldLoc.index) {
      insertIndex = raw - 1;
    }

    const newStateTree = JSON.parse(JSON.stringify(state.canvasState));
    sourceNode = null;
    removeSourceRecursive(newStateTree);
    if (!sourceNode) return state;

    const parent = findNodeById(newStateTree, parentId);
    if (!parent || !CHILD_CONTAINER_TYPES.includes(parent.type)) return state;

    const len = parent.children?.length ?? 0;
    insertIndex = Math.max(0, Math.min(insertIndex, len));

    parent.children = parent.children || [];
    parent.children.splice(insertIndex, 0, sourceNode);
    return pushPastAndMutate(state, { canvasState: newStateTree });
  }),

  // Kapsayıcının içine (listenin sonuna) taşı — canvas üzerinde kutu üzerine bırakma
  moveElement: (sourceId, targetId) => {
    if (sourceId === 'root' || sourceId === targetId) return;

    const findNodeById = (root, id) => {
      if (root.id === id) return root;
      for (const c of root.children || []) {
        const f = findNodeById(c, id);
        if (f) return f;
      }
      return null;
    };

    const subtreeHasId = (node, needleId) => {
      if (node.id === needleId) return true;
      return node.children?.some((c) => subtreeHasId(c, needleId)) ?? false;
    };

    let probe = null;
    const locateProbe = (node) => {
      if (node.id === sourceId) {
        probe = node;
        return;
      }
      node.children?.forEach(locateProbe);
    };
    locateProbe(get().canvasState);
    if (!probe || subtreeHasId(probe, targetId)) return;

    const target = findNodeById(get().canvasState, targetId);
    const CHILD_CONTAINER_TYPES = ['Section', 'Container', 'Grid', 'Card'];
    if (!target || !CHILD_CONTAINER_TYPES.includes(target.type)) return;

    const rawAppend = target.children?.length ?? 0;
    get().moveElementToIndex(sourceId, targetId, rawAppend);
  },

  getElement: (id) => {
    let foundNode = null;
    const findRecursive = (node) => {
      if (node.id === id) foundNode = node;
      if (node.children && !foundNode) node.children.forEach(findRecursive);
    };
    findRecursive(get().canvasState);
    return foundNode;
  },
  
  // Drag Drop reorder
  reorderChildren: (parentId, oldIndex, newIndex) =>
    set((state) => {
      if (oldIndex === newIndex) return {};
      const reorderRecursive = (node) => {
        if (node.id === parentId && node.children) {
          const newChildren = [...node.children];
          const [movedItem] = newChildren.splice(oldIndex, 1);
          newChildren.splice(newIndex, 0, movedItem);
          return { ...node, children: newChildren };
        }
        if (node.children) {
          return { ...node, children: node.children.map(reorderRecursive) };
        }
        return node;
      };
      const nextTree = reorderRecursive(state.canvasState);
      return pushPastAndMutate(state, { canvasState: nextTree });
    }),
}));
