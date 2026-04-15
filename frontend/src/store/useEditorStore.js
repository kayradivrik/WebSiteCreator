import { create } from 'zustand';

// Profesyonel bir açılış şablonu (Hero Section)
const initialCanvas = {
  id: 'root',
  type: 'Section',
  props: { className: 'w-full min-h-screen bg-white dark:bg-gray-950 font-sans p-8' },
  children: [
    {
      id: 'navbar-1',
      type: 'Container',
      props: { className: 'max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b dark:border-gray-800' },
      children: [
        {
          id: 'logo-text',
          type: 'Heading',
          props: { text: 'Startup.io', className: 'text-2xl font-black text-gray-900 dark:text-white tracking-tight', level: 'h1' }
        },
        {
          id: 'nav-btn',
          type: 'Button',
          props: { text: 'Get Started', className: 'px-5 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-sm' }
        }
      ]
    },
    {
      id: 'hero-section',
      type: 'Container',
      props: { className: 'max-w-7xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-8' },
      children: [
        {
          id: 'hero-title',
          type: 'Heading',
          props: { text: 'Build faster, scale smarter.', className: 'text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-7xl', level: 'h1' }
        },
        {
          id: 'hero-subtitle',
          type: 'Text',
          props: { text: 'The ultimate tool for creators to build exceptional web experiences without writing a single line of code.', className: 'max-w-2xl text-xl text-gray-500 dark:text-gray-400 leading-relaxed' }
        },
        {
          id: 'hero-actions',
          type: 'Grid',
          props: { className: 'flex gap-4 mt-4' }, 
          children: [
            {
              id: 'primary-btn',
              type: 'Button',
              props: { text: 'Start for free', className: 'px-8 py-3.5 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md' }
            }
          ]
        }
      ]
    }
  ]
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

export const useEditorStore = create((set, get) => ({
  canvasState: cloneInitialCanvas(),
  selectedElementId: null,
  currentPageId: null,
  pageName: 'Yeni sayfa',
  /** URL / SEO slug (kayıtta sunucuya gider) */
  pageSlug: '',
  /** Sunucudan gelen sayfa ayarları (dışa aktarma vb.) */
  pageSettings: { favicon: '', customCSS: '' },
  /** Canvas yakınlaştırma % (50–150) */
  canvasZoom: 100,

  setSelectedElement: (id) => set({ selectedElementId: id }),
  setPageName: (pageName) => set({ pageName }),
  setPageSlug: (pageSlug) => set({ pageSlug: typeof pageSlug === 'string' ? pageSlug : '' }),
  setCanvasZoom: (z) =>
    set(() => {
      const n = Number(z);
      if (Number.isNaN(n)) return {};
      return { canvasZoom: Math.min(150, Math.max(50, Math.round(n))) };
    }),

  loadPage: (doc) =>
    set({
      canvasState: doc.canvasState,
      currentPageId: doc._id ? String(doc._id) : null,
      pageName: doc.name || 'Yeni sayfa',
      pageSlug: doc.slug != null && doc.slug !== '' ? String(doc.slug) : '',
      selectedElementId: null,
      pageSettings: {
        favicon: doc.settings?.favicon || '',
        customCSS: doc.settings?.customCSS || '',
      },
    }),

  resetEditor: () =>
    set({
      canvasState: cloneInitialCanvas(),
      selectedElementId: null,
      currentPageId: null,
      pageName: 'Yeni sayfa',
      pageSlug: '',
      pageSettings: { favicon: '', customCSS: '' },
      canvasZoom: 100,
    }),

  /** İçe aktarılan JSON ile canvası değiştirir */
  replaceCanvasFromImport: (tree) => {
    if (!tree || typeof tree !== 'object') throw new Error('Geçersiz dosya');
    if (tree.id !== 'root') throw new Error('Kök öğe id "root" olmalı');
    if (!tree.type) throw new Error('Kök type eksik');
    set({ canvasState: tree, selectedElementId: null });
  },

  updateElementProps: (id, newProps) => set((state) => {
    const updateRecursive = (node) => {
      if (node.id === id) {
        return { ...node, props: { ...node.props, ...newProps } };
      }
      if (node.children) {
        return { ...node, children: node.children.map(updateRecursive) };
      }
      return node;
    };
    return { canvasState: updateRecursive(state.canvasState) };
  }),

  // Tailwind Class Manipülatörü
  updateElementClass: (id, classPrefix, newClassValue) => set((state) => {
    const updateRecursive = (node) => {
      if (node.id === id) {
        let currentClasses = node.props.className || '';
        // İlgili prefix ile başlayan (Örn: "bg-", "p-") bir class varsa onu kaldır. Regex kullanarak siliyoruz.
        // Uyarı: Basit bir regex yaklaışımı. 'bg-' yakalamak için boşluk ve string başı dikkate alınır.
        const regex = new RegExp(`(^|\\s)${classPrefix}[a-zA-Z0-9/-]+(\\s|$)`, 'g');
        currentClasses = currentClasses.replace(regex, ' ').trim();
        
        // Yeni classı ekle
        if(newClassValue) {
           currentClasses = `${currentClasses} ${newClassValue}`.trim();
        }

        return { ...node, props: { ...node.props, className: currentClasses } };
      }
      if (node.children) {
        return { ...node, children: node.children.map(updateRecursive) };
      }
      return node;
    };
    return { canvasState: updateRecursive(state.canvasState) };
  }),

  addElement: (parentId, componentType) => set((state) => {
    const newElement = {
      id: generateId(),
      type: componentType,
      props: { className: 'p-4 min-h-[50px] border border-dashed border-gray-300 dark:border-gray-700' },
      children: []
    };
    if(componentType === 'Text') newElement.props.text = 'New Text';
    if(componentType === 'Heading') { newElement.props.text = 'Heading'; newElement.props.level = 'h2'; }
    if(componentType === 'Button') {
      newElement.props.text = 'Click Me';
      newElement.props.href = '';
      newElement.props.targetBlank = false;
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
    return { canvasState: insertRecursive(state.canvasState) };
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
      return {
        canvasState: insertRecursive(state.canvasState),
        selectedElementId: cloned.id,
      };
    }),

  removeElement: (id) => set((state) => {
    if (id === 'root') return state; // Root silinemez
    const removeRecursive = (node) => {
      if (node.children) {
        const filteredChildren = node.children.filter(child => child.id !== id);
        return { ...node, children: filteredChildren.map(removeRecursive) };
      }
      return node;
    };
    return {
      canvasState: removeRecursive(state.canvasState),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
    };
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
    return { 
      canvasState: newState, 
      selectedElementId: clonedNodeToInsert ? clonedNodeToInsert.id : state.selectedElementId 
    };
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
    return { canvasState: newStateTree };
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
  reorderChildren: (parentId, oldIndex, newIndex) => set((state) => {
      const reorderRecursive = (node) => {
          if(node.id === parentId && node.children) {
              const newChildren = [...node.children];
              const [movedItem] = newChildren.splice(oldIndex, 1);
              newChildren.splice(newIndex, 0, movedItem);
              return { ...node, children: newChildren };
          }
           if (node.children) {
               return { ...node, children: node.children.map(reorderRecursive) };
           }
           return node;
      }
      return { canvasState: reorderRecursive(state.canvasState) };
  })
}));
